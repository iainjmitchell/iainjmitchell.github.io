---
layout: post
title:  "Using JSONP with Backbone JS"
date:   2011-09-27 11:00
categories: backbone.js, javascript, JSON
---
[JSON with Padding (JSONP)](http://en.wikipedia.org/wiki/JSONP) is a mechanism to support the retrieval of data from a server in a different domain.  This is achieved by exploiting the fact that the HTML &lt;script&gt; element can be retrieved from an external domain.  

By default, [Backbone JS](http://documentcloud.github.com/backbone/) is unable to retrieve collection or model data from a url in a different domain.  This is because Backbone is using the jQuery AJAX call with a data type of JSON rather than JSONP.

So, how do we change Backbone to use a data type of JSONP in its AJAX requests for a particular model or collection?  The solution is to provide an overridden **sync()** function on the model/collection.  **Sync()** is called by Backbone when a model/collection is synced with the data source at the url.  Normally, it just calls the standard Backbone.sync() function, but overriding this function allows us to access and alter the options being passed to the jQuery AJAX call.

In the example below, a collection is defined that connects to the Twitter API to retrieve my last 5 tweets.  The **sync()** function has been overridden and the AJAX options have been altered to use JSONP as a datatype (plus an increase in the timeout).  After the options have been adjusted it is necessary to make a call to the standard Backbone.sync() function and return the results.

```javascript
var TweetCollection = Backbone.Collection.extend({
  model: Tweet,
  url: "http://search.twitter.com/search.json?q=from:iainjmitchell+OR+@iainjmitchell&rpp=5",
  sync: function(method, model, options){
    options.timeout = 10000;
    options.dataType = "jsonp";
    return Backbone.sync(method, model, options);
  }
});
```

[Here](http://jsfiddle.net/iainjmitchell/kRRXC/) is an example of a jQuery twitter plugin that uses Backbone JS JSONP calls.