---
layout: post
title:  "Extending classes with IExtensibleObject"
date:   2012-03-16 13:16
categories: .NET, WCF
description: An explanation of IExtensibleObject interface in .NET and it's use in WCF. 
---

## Introduction

One of the key features of Windows Communication Foundation (WCF) is the ability to extend various parts of the framework, by adding and/or replacing behaviours.  Many of these extension points are implemented by using the **IExtensibleObject** interface.  This post is going to examine how this works and the reasons for using it.

## The IExtensibleObject Interface

Classes implement IExtensibleObject in order to be extendible.  The interface is defined in .NET as:

```csharp
namespace System.ServiceModel
{
    public interface IExtensibleObject<T> where T : IExtensibleObject<T>
    {
        IExtensionCollection<T> Extensions { get; }
    }
}
```

This interface ensures that implementers have a publicly accessible IExtensionCollection, which is the access point for injecting custom behaviour.  The example below demonstrates a custom extension being added, via this property, to the **InstanceContext** in WCF:

```csharp
instanceContext.Extensions.Add(customExtension);
```

The simplest implementation of this interface would look like this:

```csharp
public class ExtendableClass: IExtensibleObject<ExtendableClass>
    {
        public IExtensionCollection<ExtendableClass> Extensions 
          { get; private set; }

        public ExtendableClass()
        {
            this.Extensions = 
              new ExtensionCollection<ExtendableClass>(this);
        }
    }
```

The class adds a setter to the Extensions property, and ensures that the property is initialised during class construction.

## Implementing an extension (via IExtension)

In order to be added to the IExtensibleObject.Extensions collection, the class has to implement the generic interface IExtension.  This is defined in .NET as:

```csharp
namespace System.ServiceModel
{
    public interface IExtension<T> where T : IExtensibleObject<T>
    {
        void Attach(T owner);
        void Detach(T owner);
    }
}
```

Classes that implement this interface will have to define **Attach()** and **Detach()** functions.  These are called when automatically on an instance, when it is added to a IExtensibleObject.Extensions collection.  The owner argument will be the IExtensibleObject class that they are being added to.

Below is a very simple implementation of an extension class for our ExtendableClass.  The **Attach()** and **Detach()** functions have been implemented simply as console writes.


```csharp
public class ExtensionClass: IExtension<ExtendableClass>
{
   public void Attach(ExtendableClass owner)
   {
      console.WriteLine("attached!");
   }

   public void Detach(ExtendableClass owner)
   {
      console.WriteLine("detached!");
   }
}
```

## Putting it together

Here is an example of the ExtendableClass and ExtensionClass in action:

```csharp
var extendable = new ExtendableClass();
var extension = new ExtensionClass();
extendable.Extensions.Add(extension); //writes 'attached!' in console
extendable.Extensions.Clear(); //write 'detached!' in console
```

### So, why would I use this?

The real power of the extensions is the way that they can access the extendible object on the **Attach()** and **Detach()** functions.  They can then interact with any publicly exposed members on this, without the orchestrating code being aware of it.

Below is a different example of IExtensionObject and IExtension that demonstrate this.  The NameExtenable is the extension object, which also holds an internal list of names and methods to add and remove names.  There is also a method **GetNames()** that returns a string of all the names it holds.

```csharp
public class NameExtendable : IExtensibleObject<NameExtendable>
{
    private readonly List<string> _names = new List<string>();
    public IExtensionCollection<NameExtendable> Extensions
        { get; private set; }

    public NameExtendable()
    {
        this.Extensions = new ExtensionCollection<NameExtendable>(this);
    }

    public void AddName(string name)
    {
        this._names.Add(name);
    }

    public void RemoveName(string name)
    {
        this._names.Remove(name);
    }

    public string GetNames()
    {
        return _names.Aggregate(new StringBuilder(), 
            (sb, name) => sb.Append(name), 
            sb => sb.ToString());
    }
}

public class IainNameExtension: IExtension<NameExtendable>
{
    public void Attach(NameExtendable owner)
    {
        owner.AddName("Iain");
    }

    public void Detach(NameExtendable owner)
    {
        owner.RemoveName("Iain");
    }
}

public class TerryNameExtension : IExtension<NameExtendable>
{
    public void Attach(NameExtendable owner)
    {
        owner.AddName("Terry");
    }

    public void Detach(NameExtendable owner)
    {
        owner.RemoveName("Terry");
    }
}
```

The two extension classes (IainNameExtension and TerryNameExtension) use their **Attach()** and **Detach()** methods to add and remove a particular names to their owner.  

So when we utilise the code, like this…

```csharp
var nameExtendable = new NameExtendable();
Console.WriteLine("Names: " + nameExtendable.GetNames()); //Names: 

var iainNameExtension = new IainNameExtension();
nameExtendable.Extensions.Add(iainNameExtension);
Console.WriteLine("Names: " + nameExtendable.GetNames()); //Names: Iain

var terryNameExtension = new TerryNameExtension();
nameExtendable.Extensions.Add(terryNameExtension);
Console.WriteLine("Names: " + nameExtendable.GetNames()); //Names: IainTerry

nameExtendable.Extensions.Remove(iainNameExtension);
Console.WriteLine("Names: " + nameExtendable.GetNames()); //Names: Terry
```

..the resulting console output will resemble:

![console output](/images/consoleoutput.png)