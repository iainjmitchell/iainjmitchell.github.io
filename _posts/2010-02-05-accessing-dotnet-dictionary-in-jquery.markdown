---
layout: post
title:  "Accessing a .NET Dictionary in jQuery"
date:   2010-02-05 08:04
categories: .NET, jQuery
description: Accessing a .NET dictionary that has been serialised to JSON in jQuery.
---
Recently I noticed that the **DataContractJsonSerializer** does something peculiar with the .NET Dictionary type when serialising it to JSON. I assumed, wrongly, that it would be converted to an [associative array](https://www.pageresource.com/jscript/jarray2.htm) with the dictionary item **key** as the associative and the dictionary item **value** as object in the array. For example, the following dictionary in C#….

```csharp
var myDictionary = new Dictionary<string, string>();
myDictionary.Add("key1", "Hello");
myDictionary.Add("Key2", "World");
```
..could be accessed (after JSON serialisation) in Javascript like this:

```javascript
var myWorld = myJsonDictionary["key2"];
```

Unfortunately, this isn’t the case.  When the Dictionary is serialised to JSON it is outputted as an array of key/value pair objects.  So, you have to access the key and value like so:

```javascript
var myKey = myJsonDictionary[1].Key;
var myValue = myJsonDictionary[1].Value;
```

As you can imagine, this makes it difficult to find the value for a particular key.

For a solution to this problem I came up with the following jQuery function to return the dictionary value:

```javascript
GetDictionaryValue: function(array, key) {
        ///
        /// Get the dictionary value from the array at the specified key
        ///
        var keyValue = key;
        var result;
        jQuery.each(array, function() {
            if (this.Key == keyValue) {
                result = this.Value;
                return false;
            }
        });
        return result;
    }
```

This function uses the jQuery.each function to go around the array and check if the key of the object within matches the passed in value.  When it finds a match it assigns it to the result variable and returns false to exit the loop.

This function can then be used on any key/value pair arrays within jQuery, like so:

```javascript
var myValue = MyDictionary.GetDictionaryValue("key2");
```