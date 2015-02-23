---
layout: post
title:  "AddressFilterMode in WCF"
date:   2011-11-21 11:37
categories: .NET, WCF, XML
description: An explanation of AddressFilterMode in WCF. 
---
Recently, I have been implementing a POX (plain ol’ XML) WCF service that needed to route all requests through a single ‘handler’ operation contract. The routing to this single operation was easily implemented by adding a wildcard action to the operation contract:

```csharp
[OperationContract(Action = "*", ReplyAction = "*")]       
Message HandleRequest(Message request);
```

However, an additional requirement was for the service to respond to all messages that included the base url in their address.  For example, if the service is running at _http://localhost/myService_, it needed to accept messages addressed to _http://localhost/myservice/hello_.

In order to implement this we have to alter the WCF services **AddressFilterMode**, which can be accessed as a setting on the **ServiceBehaviour** attribute:

```csharp
[ServiceBehavior(AddressFilterMode = AddressFilterMode.Prefix)]
public class MyServiceImplementation: IMyServiceContract
{
....
}
```

[AddressFilterMode](http://msdn.microsoft.com/en-us/library/system.servicemodel.addressfiltermode.aspx) is an enumeration that has three values: **Exact**, **Prefix** and **Any**.  This setting determines which message addresses that the WCF service accepts. **Exact**, the default, will make the service ONLY respond to messages addressed to the exact service url (e.g. _http://localhost/myService_ only).  The opposite is **Any**, which will make the service accept messages for any address.  Finally, there is **Prefix**, which was used in my scenario, which ensures that the message address must include the service url.