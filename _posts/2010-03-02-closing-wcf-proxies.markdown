---
layout: post
title:  "Closing WCF Proxies / Channels"
date:   2010-03-02 13:15
categories: .NET, WCF
description: The importance of closing WCF proxies / Channels.
---
The purpose of this post is to discuss the best way of closing Windows Communication Foundation (WCF) proxies/channels.  Whether you are using a system generate proxy, or an interface initialised through a channel factory* it is inevitable that at some point you will need to close this.

A common mistake you’ll often see in WCF is the attempted closing of a proxy by the use of the **using** statement (see example below).

```csharp
using (myProxy = this.GetMyProxy())
{
  //call myProxy
}
```

A using block will call the **Dispose()** on the proxy object, but it won’t close the channel correctly.  We need to explicitly call **Close()** on the proxy to achieve this. This can be performed as follows:

```csharp
var myProxy = this.GetMyProxy();
try
{
  //call myProxy
}
finally
{
  myProxy.Close();
}
```

So, our proxy will now be closed properly, but what if something has gone wrong during one of our method calls to the proxy?  The underlying channel maybe in a **faulted** state.  Under these circumstances, calling Close() will result in an exception and the channel being left open in this faulted state.

Therefore, it is necessary to check the [CommunicationState](https://msdn.microsoft.com/en-us/library/system.servicemodel.communicationstate.aspx) of the proxy before attempting to close it.  If the CommunicationState is **Faulted**, then the proxy should be aborted rather than closed.

So, our resulting proxy closing code should resembled the following:

```csharp
var myProxy = this.GetMyProxy();
try
{
  //call myProxy
}
finally
{
  if (myProxy.State != CommunicationState.Faulted)
  {
    myProxy.Close();
  }
  else
  {
    myProxy.Abort();
  }
}
```

So in conclusion, it is important that we explicitly close() WCF proxies/channels after use to ensure that the underlying channels are closed for communication.  The using{} statement only calls Dispose() on the object, so is inadequate for our needs.

It is also important to check the state of the proxy/channel before closing as it maybe in a faulted state.  If this is the case then we should call the Abort() method.

** N.B. – If using a interface initialised through a channel factory you will need to cast the proxy to IClientChannel to be able to call the Close() and Dispose() methods. **Also, it is important to also call close on the channel factory, as otherwise the underlying connection will still be left open and you’ll start to see timeouts in your services.**