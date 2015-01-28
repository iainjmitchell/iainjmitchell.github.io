---
layout: post
title:  "Full stack testing with gulp & zombie"
date:   2015-01-28 16:39:51
categories: nodejs, gulp
---

For the latest site I've been working on, I wanted to write a couple of full stack tests using the headless browser [zombie](http://zombie.labnotes.org/).  I also wanted to automate the running of these tests using the task runner [gulp](http://gulpjs.com/).

>> N.B. If you want to try any of the following examples, you'll need the following packages from NPM:
```shell
npm install zombie --save-dev
npm install gulp --save-dev
npm install gulp-mocha --save-dev
npm install gulp-develop-server --save-dev
```

I decided to write my tests using [Mocha](http://mochajs.org/), though alternatively you can use pretty much any other node testing framework.  Here is an example of one my tests:

```javascript
var Browser = require('zombie');

describe('Full stack scenarios', function(){
  this.timeout(10000);
  Browser.localhost('mySite', 3000);

  describe('When we navigate to the index page', function(){
    var browser = Browser.create();
    before(function(done){
      browser.visit('/', done);
    });
    
    it('Then the title is correct', function(){
      browser.assert.text('title', 'Fisherprice My First Website');
    });
  });
});
```

Zombie provides a Browser object that allows you to access locally hosted sites, the **localhost()** function gives the port number of the site and an alias that zombie will use instead of localhost in the url.  

In the **before()** function of the Mocha test I instruct the browser to visit the root of the website, once this is done (it's asynchronous) it falls into the function which asserts on the sites title.  This is using the built in assert functionality within Zombie's browser object (I'm not 100% sure about whether I like this, it feels like Zombie has too many responsibilities). 

So, that's the test written, we just have to automate the running of this via gulp.  The problem with automating full-stack tests through a task runner is that you need to ensure the website is running locally before the tests are run.  We also need to tear down the website after the tests have been run.

Therefore our full-stack work flow is like this:

1.  Start website
2.  Run tests
3.  Stop website (if tests pass or fail)

Below is an interpretation of this in gulp...

```javascript
var gulp = require('gulp'),
	mocha = require('gulp-mocha'),
	server = require( 'gulp-develop-server');

gulp.task('scenarios', function() {
  server.listen( { path: './server.js' });
  return gulp
    .src('scenarios/*', {read: false})
    .pipe(mocha({reporter: 'nyan'}))
    .on('error', function(){
      server.kill();
    })
    .on('end', function(){
      server.kill();
    });
});
```

For control of the nodejs website I am using a gulp plugin called **gulp-develop-server**, this is initially used to start the website by calling **server.listen()**.  The path in the option is the js file that starts the nodejs webserver.

Once the website is started the **gulp.src()** function is used to load the test files from the specified directory, in this case it is the scenarios subdirectory.  I have specified the option to NOT read the files at this point, so gulp will just pipe a list of the files it finds in this location.

Next in the pipeline is the mocha object from **gulp-mocha**, this will execute mocha on each of the test files piped to it.  I'm using the nyan cat reporter for mocha because for some reason I still find an ASCII rendering of a nyan cat amusing.

```shell
1   -__,------, 
0   -__|  /\_/\  
0   -_~|_( ^ .^) 
    -_ ""  "" 
```

The final part of the gulp task is to ensure that the website is stopped at the end of test run.  Fortunately, **gulp-develop-server** provides a function called **kill()** to terminate the site.  To ensure that this is run, regardless of whether the tests passed or failed, I have included a call to **server.kill()** in both the 'end' and 'error' event handlers.

Now we should be able to execute our full stack tests by running the following in the shell:

```shell
	gulp scenarios
```