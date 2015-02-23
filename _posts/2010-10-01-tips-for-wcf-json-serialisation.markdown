---
layout: post
title:  "4 Tips on WCF JSON serialisation"
date:   2010-10-01 12:24
categories: .NET, WCF, JSON
description: Tips on serialising to JSON through WCF.
---
# 1. Excluding null fields from serialisation

By default all serialisers in WCF, including the [DataContractJsonSerializer](http://msdn.microsoft.com/en-us/library/system.runtime.serialization.json.datacontractjsonserializer.aspx), will automatically serialise ALL Data Member properties.  So, if your property is not set it will serialise as _null_.  

For example, the following DataContract is serialised with PropertyTwo set to ‘aValue’ and PropertyOne left unset….

```csharp
[DataContract]
public class MyContract
{
  [DataMember]
  public string PropertyOne
  {
    get;
    set;
  }
  [DataMember]
  public string PropertyTwo
  {
    get;
    set;
  }
}
```

..the resulting JSON after serialisation will look like this:

```json
{"PropertyOne": null, "PropertyTwo": "aValue"}
```

This can cause problems as there are jQuery plugins that require properties to be _undefined_ if they are not known  – because they use [extend()](http://api.jquery.com/jQuery.extend/) internally to add the default values.

The solution to this is set the DataMember’s attribute [EmitDefaultValue](http://msdn.microsoft.com/en-us/library/system.runtime.serialization.datamemberattribute.emitdefaultvalue.aspx) option to **false**.  This will stop any unset properties being included in the serialised JSON.

For example, the following DataContract (with EmitDefaultValue set to false) is serialised with PropertyTwo set to ‘aValue’ and PropertyOne left unset….

```csharp
[DataContract]
public class MyContract
{
  [DataMember(EmitDefaultValue = false)]
  public string PropertyOne
  {
    get;
    set;
  }
  [DataMember(EmitDefaultValue = false)]
  public string PropertyTwo
  {
    get;
    set;
  }
}
```

..the resulting JSON after serialisation will look like this:

```json
{"PropertyTwo": "aValue"}
```

# 2. Renaming properties in the JSON

In the .NET world Microsoft naming standards state that public properties of an object have to start with a capital letter.  However, our friends in the Javascript world favour properties that start in lowercase.  Fortunately, we can avoid any potential conflict by the use of the DataMember’s [Name](http://msdn.microsoft.com/en-us/library/system.runtime.serialization.datamemberattribute.name.aspx) attribute. 

For example, if we JSON serialise the following DataContract… 

```csharp
[DataContract]
public class MyContract
{
  [DataMember(Name="propertyOne")]
  public string PropertyOne
  {
    get;
    set;
  }
}
```

..the resulting JSON will look like this:

```json
{"propertyOne": "aValue"}
```

# 3. The Enum Serialisation problem

By default the WCF Data Contract serialisers will convert Enum values into their numerical representation.  With JSON serialisation it would be more useful if we could return the string value of the Enum as it would make more sense than just a numeric value.

The EnumMember attribute does have a property called Value, which is designed for just this use.  But for some reason, known only to those at Microsoft, the DataContractJsonSerializer ignores the EnumMember attribute.  Strange but true.

So, how can we get a string value of our Enum into our JSON?  Here is a handy work around:

```csharp
[DataContract]
public class MyContract
{
  public MyEnum PropertyOne
  {
    get;
    set;
  }

  [DataMember(Name="PropertyOne")]
  public string PropertyOneString
  {
    get { Enum.GetName(typeof(MyEnum), this.PropertyOne); }
    set { this.PropertyOne = (MyEnum)Enum.Parse(typeof(MyEnum), value); }
  }
}
```

The property that is serialised into JSON is PropertyOneString – a String value of the enumeration, but we are using the Name setting on the attribute to rename this to PropertyOne.  So, it looks like the same property in .NET CLR and within the JSON.

# 4. Serialising JSON dates in Javascript

Unfortunately, [Douglas Crockford’s JSON2](http://www.json.org/js.html) utility for serialisation of Javascript objects into JSON does not convert the date into the format that the DataContractJsonSerializer understands.

Rick Strahl has made an adapted version of the JSON2 code that does handle Microsoft date formats.  See [this](http://www.west-wind.com/weblog/posts/729630.aspx) article for further details.  His version of JSON2 can be found directly in [this zip](http://www.west-wind.com/weblog/images/200901/ServiceProxy.zip) (it’s at the bottom of the in the ServiceProxy.js file). 