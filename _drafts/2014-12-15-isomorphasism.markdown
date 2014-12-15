---
layout: post
title:  "Isomorphasism"
date:   2014-12-15 19:49:51
categories: DDD
---

#pq-System

> **DEFINITION:** 
> *x*P-Q*x*- is an [axiom](http://en.wikipedia.org/wiki/Axiom), whenever *x* is composed of hyphens only.

> **RULE OF PRODUCTION:**
> Suppose *x*, *y* and *z* all stand for particular strings containing only hyphens.  
> And suppose that *x*P*y*Q*z* is known to be a theorem.  
> Then *x*P*y*-Q*z*- is a theorem.

The author then asks the reader to discover the [descision procedure](http://en.wikipedia.org/wiki/Decision_problem) of the formal system, which is revealed to be that the first two hypen groups should add up, in length, to the third hypen group.

So [theorems](http://en.wikipedia.org/wiki/Theorem) would include:

```
--P---Q-----

-P--Q---

-P---Q----
```

And would not include:

```
--P--Q-

-P-Q---
```
