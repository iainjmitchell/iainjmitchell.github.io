---
layout: post
title:  "Getting JQuery and WCF to talk (part two of two)"
date:   2010-01-21 08:26
categories: jQuery, WCF, AJAX
---

# Introduction

In my last article I covered how to get **JQuery** to call a **WCF** method.  This included the passing of arguments and the handling of any return values.  In this, the second part, I will cover the final piece of the JQuery / WCF communication jigsaw, the throwing and handling of faults.

# Setting up the ErrorHandler

When any type of FaultException is raised from a web enabled WCF service the default behavior is to throw a HTTP 400 error.  If the **includeExceptionDetailInFaults** service behavior is enabled then a serialized stack trace is also sent across the wire (I strongly advise turning this off before your code goes to deployment).

However, we often need to send more detailed fault information to the JQuery client, as the client may respond differently to different types of error.

To achieve this we need to intercept the outgoing error message and insert a **JSON** serialised version of the error message.  Fortunately, WCF provides extendible error handling behavior that will allow us to alter the error message to our needs.

The first part of adding this behavior is to define a custom error handler to convert any  exceptions raised into a Json formatted fault.  Here is a custom error handler I use for this conversion:

```csharp
public class JsonErrorHandler: IErrorHandler
{
  #region Public Method(s)
  #region IErrorHandler Members
  ///
  /// Is the error always handled in this class?
  ///
  public bool HandleError(Exception error)
  {
    return true;
  }

  ///
  /// Provide the Json fault message
  ///
  public void ProvideFault(Exception error, MessageVersion version,
    ref Message fault)
  {
    fault = this.GetJsonFaultMessage(version, error);

    this.ApplyJsonSettings(ref fault);
    this.ApplyHttpResponseSettings(ref fault,
      System.Net.HttpStatusCode.BadRequest, Resources.I_StatusMessage);
  }
  #endregion
  #endregion 

  #region Protected Method(s)
  ///
  /// Apply Json settings to the message
  ///
  protected virtual void ApplyJsonSettings(ref Message fault)
  {
    // Use JSON encoding
    var jsonFormatting =
      new WebBodyFormatMessageProperty(WebContentFormat.Json);
    fault.Properties.Add(WebBodyFormatMessageProperty.Name, jsonFormatting);
  }

  ///
  /// Get the HttpResponseMessageProperty
  ///
  protected virtual void ApplyHttpResponseSettings(
    ref Message fault, System.Net.HttpStatusCode statusCode,
    string statusDescription)
  {
    var httpResponse = new HttpResponseMessageProperty()
    {
      StatusCode = statusCode,
      StatusDescription = statusDescription
    };
    fault.Properties.Add(HttpResponseMessageProperty.Name, httpResponse);
  }

  ///
  /// Get the json fault message from the provided error
  ///
  protected virtual Message GetJsonFaultMessage(
    MessageVersion version, Exception error)
  {
    BaseFault detail = null;
    var knownTypes = new List&lt;Type&gt;();
    string faultType = error.GetType().Name; //default

    if ((error is FaultException) &amp;&amp;
        (error.GetType().GetProperty("Detail") != null))
    {
      detail =
        (error.GetType().GetProperty("Detail").GetGetMethod().Invoke(
         error, null) as BaseFault);
      knownTypes.Add(detail.GetType());
      faultType = detail.GetType().Name;
    }

    JsonFault jsonFault = new JsonFault
    {
      Message = error.Message,
      Detail = detail,
      FaultType = faultType
    };

    var faultMessage = Message.CreateMessage(version, "", jsonFault,
      new DataContractJsonSerializer(jsonFault.GetType(), knownTypes));

    return faultMessage;
  }
  #endregion
}
```

The **IErrorHandler** interface defines two methods for dealing with a fault.  The first **HandleError()** gives a response to say whether this error handler has dealt with the exception.  In the case of my error handler, it handles ALL outbound exceptions/faults so it always returns true.

The second method is **ProvideFault()**, this takes in a ref to the outgoing message and passes in the exception that has been raised.  As you’ve probably guessed this is where the actual fault is placed into the message.  In my solution this calls a number of protected methods to build up the message and it’s settings.

I have defined a protected method called **GetJsonFaultMessage()** to build the new outgoing message.  In my solution it is testing whether the exception is a FaultException with detail and if so it appends the Fault DataContract contained in the detail to the DataContract I am placing in the message (JsonFault – It’s declaration is omitted).

Once you have a fault message to send out we need to ensure that the message is going to be serialised into Json and treated as a Http response.  This is what the other two protected methods **ApplyJsonSettings()** and **ApplyHttpResponseSettings()** are performing.

So, now we have our error handler we need to be able to attach this onto our Json WCF service endpoint.  In order to do this we’ll need to write a custom behavior and behavior element.

# Setting up the Custom Behavior

To be able to apply the error handler we need to create a custom **WebHttpBehavior** to insert it into the channel dispatcher associated with our endpoint.  This also has to remove any default behaviors that have been added to the channel dispatcher.

Below is an example of how to construct this custom WebHttpBehavior:

```csharp
public class JsonErrorWebHttpBehavior: WebHttpBehavior
{
  #region Protected Method(s)
  /// 
  /// Add the json error handler to channel error handlers
  /// 
  protected override void AddServerErrorHandlers(ServiceEndpoint endpoint,
    System.ServiceModel.Dispatcher.EndpointDispatcher endpointDispatcher)
  {
    // clear default error handlers.
    endpointDispatcher.ChannelDispatcher.ErrorHandlers.Clear();

    // add the Json error handler.
    endpointDispatcher.ChannelDispatcher.ErrorHandlers.Add(
      new JsonErrorHandler());
  }
  #endregion
}
```

To be able to apply this behavior to an endpoint through the configuration file we also require a BehaviorElement defined – like the one defined below:

```csharp
public class JsonErrorWebHttpBehaviorElement : BehaviorExtensionElement
{
  /// 
  /// Get the type of behavior to attach to the endpoint
  /// 
  public override Type BehaviorType
  {
    get
    {
      return typeof(JsonErrorWebHttpBehavior);
    }
  }

  /// 
  /// Create the custom behavior
  /// 
  protected override object CreateBehavior()
  {
    return new JsonErrorWebHttpBehavior();
  }
}
```

# Configuring the Json Custom Error Behavior

Now that we have our custom error handler and custom behavior, we just need to alter our services web.config file to define the custom behavior and associate it with our Json enabled WCF service.

Here is an updated web.config from the previous article, which has the error behavior added to the service endpoint:

[![Web.config set up with Json error handling behavior](http://iainjmitchell.com/blog/wp-content/uploads/2010/01/JsonErrorConfig.png "Web.config set up with Json error handling behavior")](/images/JsonErrorConfig.png)

The behavior extensions section includes an entry for our previously defined **JsonWebHttpBehaviorElement**.  N.B. The type must be the full name of the class which includes namespace, assembly, version, culture and public key token.  If this is not all specified then WCF will probably fail in the loading of the behavior.

Our newly defined behavior extension (jsonWebHttp) is included in the  **JsonBehavior** endpoint behavior configuration.  This has already been defined as the behaviorConfiguration for out service “MyApp.MyService”, so our WCF service will now return Json faults.

# The JQuery client side

Here is the Jquery.Ajax call from the previous article, altered to include the WCF fault handling:

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
     var jsonFault = JSON.parse(message.responseText);
     alert(jsonFault.Message);
   }
});
```

As you can see, the error handling function has been altered to create a jsonFault object from the JSON contained in the responseText property of the message.  I’m using the JSON.parse(string) function of [this](http://json.org/json2.js) JSON library to perform the conversion.  Once we have the object we can access the WCF fault data contract properties on it (this is my outer JsonFault fault class, the .Detail property would contain the specific WCF fault).

# Conclusion

In this article I have demostrated how to set up a WCF service to return Json formatted faults and how to catch these in the JQuery Ajax call.

The WCF service requires a custom error handler to convert the fault message contents to JSON and change it to a HTTP response.  A custom WebHttpBehavior is required to insert the error handler onto the channel dispatcher of the endpoint, and a behavior element is needed to be able to add this as a behavior extension in the web.config.  Once all of these are in place the service can be configured in the web.config to use the JSON error handler.

At the JQuery client we just need to define an error handler on the Ajax call.  To access the returned fault we just have to simply JSON.parse the return messages responseText property.