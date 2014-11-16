---
layout: post
title:  "Exposing functions on jQuery plugins"
date:   2010-08-26 08:19
categories: jQuery
---
# Introduction

For some [jQuery plugins](http://docs.jquery.com/Plugins/Authoring) it would be useful if we could expose one or more functions, so that we can interact with it from Javascript outside the plugin. If we follow the standard mechanism of plugin authoring, we can only interact with the it at the moment of initialisation. This post will look at two mechanisms that can be used to expose and access plugin functions.

This post will be based around the following mediaPlayer fictional plugin:

<div class="dp-highlighter"><div class="bar"></div>

```javascript
(function($) {
  $.fn.mediaPlayer = function(options){
  .........
  }
})(jQuery);
```

This mediaPlayer plugin would work by being attached to a selected DIV element in the DOM, like this:

```javascript
$('.myDiv').mediaPlayer(options);
```

Now suppose we now want to interact with our mediaPlayer from outside.  For example, we may want to trigger the media player to play a certain file.  It would be useful if we could have a play() function on our plugin so we can trigger this action.  So, how can we do this?

# Class and Function Mechanism

With the standard mechanism of building a jQuery plugin we always ensure that the plugin function returns **this** (the current context of the plugin).  The reason for returning the current context is that it allows the plugin call to be chained onto another plugin call.  For example:

<div class="dp-highlighter"><div class="bar"></div>

```javascript
$('.myDiv')
   .mediaPlayer(options)
   .otherPlugin();
```

There is another approach to building jQuery plugins, called the **class and function** approach (see [this](http://fuelyourcoding.com/jquery-plugin-design-patterns-part-i/) excellent article of jQuery design patterns).  Instead of returning the current context, the jQuery plugin creates and then returns a new instance of a JavaScript class.  So, our mediaPlayer plugin could be created in the following way:

```javascript
(function($) {
  //the class
  var player = function(options){
    return createApi();    

    function createApi(){
      return {
        play : play
      }
    }

    function play(url) {
      //our play code
    }
  }
  //the function
  $.fn.mediaPlayer = function(options){
    //create an instance of the class and return from the plugin
    return new player(options); 
  }
})(jQuery);
```

If the Javascript that creates the plugin stores a reference to returned instance it can continue accessing it’s public API.  For example: 

<div class="dp-highlighter"><div class="bar"></div>

```javascript
var myMediaPlayer = $('.myDiv').mediaPlayer(options);
myMediaPlayer.play(url1);
myMediaPlayer.play(url2);
```

However, there is a bit of a problem with this approach. Because it returns the instance of the class rather than the current context, it breaks the chaining of plugins in jQuery.  We can no longer do this…

<div class="dp-highlighter"><div class="bar"></div>

```javascript
$('.myDiv')
   .mediaPlayer(options)
   .otherPlugin();
```

…we would have to do this instead:

<div class="dp-highlighter"><div class="bar"></div>

```javascript
$('.myDiv')
   .mediaPlayer(options);
$('.myDiv')
   .otherPlugin();
```

# Execution Through apply() Mechanism

An alternative, and my preferred approach, is to execute the ‘public’ functions in the main plugin function by use of the **apply()** command.  For this approach to work the plugin function has to be effectively overloaded, so that it can be used in two ways.  It needs to retain it’s constructive form which in out case takes one argument of options, but it also needs to be able to accept an alternative call that takes a string argument (function name) and any additional arguments that this function requires.

The example below shows how we might use this mechanism to build our mediaPlayer plugin.

```javascript
(function($) {
    //define the commands that can be used
    var commands = {
        play: play,
        stop: stop
    };

    $.fn.mediaPlayer = function() {
        if (typeof arguments[0] === 'string') {
            //execute string comand on mediaPlayer
            var property = arguments[1];
            //remove the command name from the arguments
            var args = Array.prototype.slice.call(arguments);
            args.splice(0, 1);

            commands[arguments[0]].apply(this, args);
        }
        else {
            //create mediaPlayer
            createMediaPlayer.apply(this, arguments);
        }
        return this;
    };

    function createMediaPlayer(options){
       //mediaPlayer initialisation code
    }

    //Exposed functions 
    function play(url) {
      //code to play media
    }

    function stop() {
      //code to stop media
    }
})(jQuery);
```

When the plugin function is called the first argument is examined to see what type it is.  If this is NOT a string it is a call to initialise a mediaPlayer and so the createMediaPlayer() method is executed by using the apply() command.  It uses apply as it 1) ensures that the context is correct (**this** is passed as the context); and 2) allows us to pass the argument(s) without caring about how many there are.

If the first argument is a string, then this must be the name of the function that is required to be executed.  A new arguments array is prepared by stripping off the first argument (see [this](http://anotherdeveloperblog.co.uk/post/Using-the-arguments-array-like-a-normal-array.aspx) blog post about splice), as the called method won’t need this.  Then the named function is executed by calling apply() and passing the current context and our new list of arguments.  You might notice that when this named function is executed it has to retrieved from the commands object by using the bracket notation.   This is required for the apply() function to be able to execute functions dynamically from string values.

This is how we would initialise this plugin and call the play() function:

<div class="dp-highlighter"><div class="bar"></div>

```javascript
$('.myDiv')
   .mediaPlayer(options);

$('.myDiv')
   .mediaPlayer('play', url1);
```

As the context is always returned from the plugin function we can still chain calls to our selected DIV:

```javascript
$('.myDiv')
   .mediaPlayer(options)
   .otherPlugin();

//chain calls to our play method...
$('.myDiv')
   .mediaPlayer('play', url1)
   .mediaPlayer('play', url2);
```

# Conclusion

In this post I’ve looked at two mechanisms that can be used to expose functions on jQuery plugins.  The first of these is the **Class and Function Mechanism** that exposes ‘public’ functions by returning an instance of a class from the plugin initialisation function.  Although this does allow functions to be exposed, it does break jQuery chaining and so is not ideal.  

The **Execution Through apply() Mechanism** still allows jQuery chaining as the current context is still returned from the plugin initialisation function.  This mechanism allows access to functions by effectively overloading the initialisation function to allow the name of the function that is to be executed to be passed in.  This function can then be executed by using the JavaScript apply() command.