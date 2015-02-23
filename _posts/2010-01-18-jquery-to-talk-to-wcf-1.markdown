---
layout: post
title:  "Getting JQuery and WCF to talk (part one of two)"
date:   2010-01-18 20:19
categories: jQuery, WCF, AJAX
description: Getting jQuery to talk to WCF (one of two).
---

# Introduction

Windows Communication Foundation (**WCF**) is the swiss army knife of the software communication world.  Even though most seem to use it as a replacement for SOAP web services or remoting in their .NET framework applications, it is actually also darn good at talking and being exposed to other none .NET environments.

In this and it’s accompanying post I am going to cover the steps required to get **JQuery** and **WCF** “talking”.  This post will focus on the communication between the two using JQuery **Ajax **(Asynchronous JavaScript and XML).  The concluding post will look at error/fault handling between the two.

# Creating the WCF service

The easiest way of setting up a WCF for use with JQuery is exposing the service through IIS, like a standard ASP.NET web service.  With Visual Studio 2008 and onwards there is a template for creating such a service.

The key component created in this template is the **.svc** file. This is a simple text file that is targeted by the client and then used by IIS to determine which service to start.  Here is an example of the contents of this file:

```xml
<%@ ServiceHost Language=”C#” Service=”MyApp.MyWebService” >
```

This file is saying when a request comes in please start the service called “MyApp.MyWebService” and this is in C#.

There will be a service defined in the web.config file of the same name.  The service code is stored either in a dll in the bin or in the app_code of the virtual directory (N.B. The service implementation code has to be stored in a class called **MyWebService** in the **MyApp.Web.Service** namespace).

# Defining the Service

The key to getting JQuery and WCF to communicate is the how they send their objects and other values across the wire.  Obviously, JQuery cannot utilise WCF DataContacts and .NET types, so we have to serialise/deserialise any outgoing/incoming values into **JSON** (JavaScript Object Notation).

Fortunately, it is very easy to do this in WCF by using the ResponseFormat and RequestFormat a  settings on the [WebInvoke] attribute.  we just have to set these to be a Json web message format, for example:

```csharp
[ServiceContract]
public interface IMyService
{
  [OperationContract]
  [WebInvoke(Method = "POST",
               BodyStyle = WebMessageBodyStyle.Wrapped,
               ResponseFormat = WebMessageFormat.Json,
               RequestFormat= WebMessageFormat.Json) ]
  string HelloWorld(string name);
}

public class MyService: IMyService
{
  public string HelloWorld(string name)
  {
     return String.Format("Hello {0}", name);
  }
}
```

The setting of ResponseFormat and RequestFormat to Json informs WCF to use the **DataContractJsonSerializer** on any incoming arguments and outgoing result.

# Setting up the web.config

The web.config has to be updated to include the WCF service.  If you have used the WCF service project in Visual Studio this will have already been automatically created for you.  However, it is likely that the service endpoint will need altering to allow JQuery communication.  The reason for this is that the service endpoint MUST be exposed using **WebHttpBinding**.  This is the only type of binding that supports the transfer of JSON objects to and from JQuery.

It is also necessary to add the inbuilt WCF behavior, called **&lt;webHttp/&gt;** on the endpoint.  This enables the web programming model…. thus allowing the communication from our JQuery client.

Our resulting web.config file will resemble the following:

[![WCF web.config for JQuery communication](http://iainjmitchell.com/blog/wp-content/uploads/2010/01/jsonwcfconfig1.png "WCF web.config for JQuery communication")](/images/jsonwcfconfig1.png)

Remember, the service name MUST match the value in the services .svc file and the namespace/name of the service implementation in code (if you are not using the code behind setting in the .svc file).

Once all these components are installed in the appropriate place within the IIS virtual directory then your Jquery WCF service is ready to go.

# The JQuery client side

The JQuery Ajax call can be used to access the WCF service, for example:

```javascript
$.ajax({
   type: "POST",
   contentType: "application/json; charset=utf-8",
   url: "Services/MyApp.svc/HelloWorld",
   data: '{"name":"Iain"}',
   dataType: "json",
   success: function(response) {
     alert(response.HelloWorldResult);
   },
   error: function(message) {
     alert("error has occured");
   }
});
```

The url is set to the location of the .svc file plus the name of the method you wish to call on service.  In the example above my .svc file is stored in a directory called services in the virtual directory.

You may also notice that the data is a hardcoded JSON string.  The important thing to remember with this is that the parameter name (in this case “name”) MUST match the name of the parameter declared in the method.  For more complex objects there are JQuery libraries, such as [this](http://json.org/json2.js) excellent one by John Resig to do the conversion from javascript to a JSON string.

The final point to mention is accessing the result.  In the success code you’ll notice that it is passed a response object.  This will contain a property named _&lt;methodname&gt;_**Result** containing the result from the WCF call.

# Conclusion

In this article I have demonstrated the steps required to get JQuery to communicate with a WCF service.

At the server side JSON formatting needs to be enabled on the WCF method and an endpoint needs to be defined using the WebHttpBinding with the additional &lt;webHttp/&gt; behavior.  It is also necessary to have a .svc file defined which the JQuery ajax call can be pointed at to access the service.

On the client, the JQuery Ajax call can be used to communicate with the service.  Arguments are passed as JSON strings, but the parameter names must match those in the method declaration.  Any return values are passed in the response object in a property named &lt;methodname&gt;Result.
