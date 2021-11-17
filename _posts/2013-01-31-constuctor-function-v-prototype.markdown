---
layout: post
title:  "Constructor Function v Prototype in Javascript"
date:   2013-01-31 10:15
categories: Javascript, OO
description: Looking at the difference between two mechanisms of creating objects in Javascript, Constructor Function and Prototype.
---
There are two main mechanisms for creating objects in Javascript, these are known as **Constructor Function** and **Prototype**.  In this post I will run through an example of each and explain my preference.

Lets say we want to create a Cat object, this has to be constructed with the cats name (e.g. Terry) and it also needs a single method called _sayHello()_ which will reveal the cats name.  Our orchestrating code would look something like this:

```javascript
var aCat = new Cat("Terry");
alert(aCat.sayHello()); 
//alerts "Meow! My name is Terry"
```

If we coded this using the **Constructor Function** approach, it would look something like this:

```javascript
var Cat = function(name){
  function sayHello(){
    return "Meow! My name is " + name;
  }

  return {
    sayHello: sayHello
  };
};
```

The code creates a new function assigned to the variable Cat, so every time a **new** Cat is created this function is executed.  This function also has a parameter ‘name’ which will be the argument passed into the constructor.

Within the closure (scope of the function) is our _sayHello()_ method, this is only revealed publicly on an instance of Cat because it is included in the associative array that is returned from the constructor function (lines 6 to 8).  

You may notice that the ‘name’ parameter of the constructor is also being used within the _sayHello()_ function, this is a consequence of the function being defined within the closure of the constructor function.  Many find this odd and it often confuses people when they are new to Javascript, but it is a very powerful technique which is especially when dealing with the complex nature of context.

So, what would the solution look like using the alternative **prototype** approach?

```javascript
var Cat = function(name){
  this.name = name;
};

Cat.prototype.sayHello = function(){
    return "Meow! My name is " + this.name;
};
```

Again, in this example the base object is a function that takes an argument of ‘name’, the difference here is that we have to assign name to **this** (the result of the executed function).  

The public method _sayHello()_ has to be assigned to a special area on the Object definition called the prototype, any functions attached added to this will be available to all new instances created. A big advantage of using the prototype is that only one definition of this method will exist in memory, regardless of how many Cats we create.

Because the _sayHello()_ method is defined outside the closure of the base object function, the only way it can access the name property is by using the **this** keyword.  Unfortunately this also means that the name field is available outside the object instance, otherwise known as a public field!  This means I could do the following with the prototype code:

```javascript
var terry = new Cat("Terry");
terry.name = "Roy"
alert(aCat.sayHello()); 
//alerts "Meow! My name is Roy" oops!
```

I’m a strong advocate of not revealing object state, so I very rarely use the **prototype** approach.  Some suggest that you can get around it by having a naming convention for fields you should not touch externally, but to me this seems brittle and open to abuse, especially if third parties have to consume your code.

Some people like to use **prototype** as it also supports Object inheritance, but I would argue that sharing behaviour through aggregation is a much better approach than inheritance.    

**Constructor Function** also has the advantage of allowing you to define private functions and internal composite objects, an approach also used in the excellent [Javascript module pattern](https://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth "Javascript module pattern").