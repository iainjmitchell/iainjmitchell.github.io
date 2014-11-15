---
layout: post
title:  "Implementing the Repository pattern with MongoDB and coffeescript/nodejs"
date:   2012-01-02 14:24
categories: Coffeescript, DDD, MongoDB, nodejs
---

The [Repository Pattern](http://martinfowler.com/eaaCatalog/repository.html) is a useful mechanism to abstract the mechanics of the data store away from the business logic. There are various ways of implementing a repository against a relational database, the mechanics could use plain old SQL or something more exotic like nHibernate or Entity Framework.

This post is going to look at constructing a generic repository to use against a mongoDB data store, and because I want to show how ‘hip’ I am, the example will be in coffeescript with nodejs.

#Prerequisites

You will need:

* [nodejs](http://nodejs.org/download/) & [mongoDB](http://docs.mongodb.org/manual/installation/) installed
* [coffeescript](https://www.npmjs.org/package/coffee-script) npm package (npm install -g coffee-script)
* [mongojs](https://github.com/gett/mongojs) npm package (npm install -g mongojs)

#Implementing Create and Read operations

The first requirement of our repository is that it needs to connect to the mongoDB database, which can be implemented in the classes constructor.

```coffee
database = "localhost/myDatabase"  
  
class Repository  
    constructor: (@objectName) ->  
        @db = require("mongojs").connect(database, [@objectName])  
```

Within the constructor, the passed in object name and the database connection string are used to retrieve a connection to the database, that includes the specified objects collection. This connection is stored in the class variable db, so it can be accessed in our repository class operations.

*Note: In the example above the database connection is specified as a variable above the class – it would be much better to read this from a configuration file or environment variable.*

To facilitate the management of domain entities or value objects, repositories need to provide **CRUD** (Create, Read, Update, Delete) operations on the object. As Javascript is a dynamic language and mongoDB is a document datastore, our code for the write operation will be straightforward:

```coffee
add: (value) ->  
    @db[@objectName].save(value)  
```

The add method takes in the value to add (the object), it then requests the objects collection from the database connection and saves the object to it. This is the equivalent of calling *db.myObject.save({object})* on the mongoDB command line. Alternatively, you could use the .add() method, but unlike the .save() method, this will not save the object if it already exists (by uuid) in the collection.

Implementing the CRUD read operation is also fairly straightforward, certainly much simpler than relational database repositories which require specialised query objects to be passed in and repository strategies to be formulated.

```coffee
find: (query, callback) ->  
    @db[@objectName].find(query, (err, docs) -> callback(docs))  
```

This .find() method accepts a query object that is passed to the mongojs .find() method, which locates any documents (objects) that match this query. The result is passed back to the caller via the passed in callback function.

*Note: It is also possible to identify and log any errors encountered, using the first (err) argument of the mongojs callback.*

The example below demonstrates how the .add() and .find() methods can be used to add objects to the data store, and then search for matching documents.

```coffee
repository = new Repository("Donkey")  
  
donkey1 = {name: "chris", age: 12}  
repository.add(donkey1)  
  
donkey2 = {name: "colin", age: 32}  
repository.add(donkey2)  
  
query = {age: 12}  
repository.find(query, (donkeys) ->   
    console.log donkey for donkey in donkeys  
    #expected console output = {name: "chris", age: 12}  
)  
```

#Updating and Deleting

Now that we have our objects added to the data store, we also need to be able to make amendments to, and delete them. In order to find the records that we want to change, the .update() method must also accept a query object (see below).

```coffee
update: (query, value) ->  
    @db[@objectName].update(query, {$set: value}, {multi: true})  
```

In addition, to this it also needs to accept the updated value(s), which are encapsulated in the value argument. Both of these are used in the mongojs .update() call executed from within the repository method. The update values are passed as a $set parameter, that ensures that ONLY the fields specified in the value object are updated – none specified fields are left with the value they held prior to the update. It is also worth mentioning that the third argument to mongojs includes a multi property that is set to true – if this is NOT set then only the first matching object will be updated in the collection.

Deleting is much more straightforward, as all our .remove() method needs is a query that specifies the objects that need removing from the collection. So, this can be quite simply implemented as:

```coffee
remove: (query) ->  
    @db[@objectName].remove(query)  
```

#Putting it all together

Our resulting repository code will resemble:

```coffee
database = "localhost/myDatabase"  
  
class Repository  
    constructor: (@objectName) ->  
        @db = require("mongojs").connect(database, [@objectName])  
    add: (value) ->  
        @db[@objectName].save(value)  
    find: (query, callback) ->  
        @db[@objectName].find(query, (err, docs) -> callback(docs))  
    update: (query, value) ->  
        @db[@objectName].update(query, {$set: value}, {multi: true})  
    remove: (query) ->  
        @db[@objectName].remove(query)  
          
exports.Repository = Repository  
```

*Note: The exports is required to make it available in a different file, through the nodejs require command.*

Here is an example of all the repository methods being exercised:

```coffee
repository = new require("./Repository.js").Repository("Donkey")  
  
donkey1 = {name: "chris", age: 12}  
repository.add(donkey1)  
  
donkey2 = {name: "colin", age: 32}  
repository.add(donkey2)  
  
query = {age: 12}  
repository.find(query, (donkeys) ->   
    console.log donkey for donkey in donkeys  
    #expected console output = {name: "chris", age: 12}  
    query2 = {name: "chris"}      
    repository.update(query2, {age: 100})  
    #chris's age set to 100  
    repository.remove(query2)  
    #chris removed  
)  
```
#Conclusion

In this post I have demonstrated how a generic repository can easily be implemented in a dynamic language against a mongoDB database. You may very well be asking that if it is so simple then why bother with the repository at all? I would always argue that the abstraction of the data store is crucial to even the simplest of applications, what if the data suddenly needed to be stored in a different data store? By abstracting the data store logic out, we keep our domain code lean and free of vender specific implementation detail.

#UPDATE

This repository implementation is now available on through Node Package Manager (NPM).

```sh
npm install mongorepository
```