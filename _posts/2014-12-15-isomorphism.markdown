---
layout: post
title:  "Isomorphism"
date:   2014-12-15 19:49:51
categories: Refactoring
description: The relationship between isomorphism and naming in software.
---

Recently I've been reading a fascinating book by Douglas Hofstadter called [Gödel, Escher, Bach](https://en.wikipedia.org/wiki/G%C3%B6del,_Escher,_Bach).  In an early chapter he introduces the concept of *Formal Systems*, which is any system of abstract thought based upon the model of mathematics. 

Further into the book a Formal System called the PQ-system is proposed.

> **DEFINITION:** 

> *x*P-Q*x*- is an [axiom](https://en.wikipedia.org/wiki/Axiom), whenever *x* is composed of hyphens only.

> **RULE OF PRODUCTION:**

> Suppose *x*, *y* and *z* all stand for particular strings containing only hyphens.  
> And suppose that *x*P*y*Q*z* is known to be a theorem.  
> Then *x*P*y*-Q*z*- is a theorem.

The author then asks the reader to discover the [decision procedure](https://en.wikipedia.org/wiki/Decision_problem) of the formal system, which is revealed to be that the first two hypen groups should add up, in length, to the third hypen group.

So [theorems](https://en.wikipedia.org/wiki/Theorem) would include:

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

You may have noticed that effectively this formal system is about adding two numbers together, the - represents a count and the number of these either side of the P add up to the number after the Q.  So, the theorem --P---Q----- is equivalent to 2 + 3 = 5.

This leads us to an interesting discovery, does the symbol P actual mean 'Plus' and the symbol Q mean 'eQuals'?  This is an example of isomorphism, we are attaching a real world meaning to a symbol in a Formal System.  

But are our isomorphic assumptions correct?  Does it influence our discovery of the Decision Procedure and thus the entire Formal System?

Programming languages are a form of Formal Systems, so it's unsurprising that this same problem plays out in the code we write. Take the following example of LINQ (stolen from a Microsoft example).

```csharp
people.Select(p => new { Name = p, p.Length }); 
```
But what is *p*?  A sensible suggestion would be person as the collection is named people, but it could be pupil or even something not beginning with the letter p.

The lack of clarity could cause confusion to future readers of this code, it may even lead them to wrong assumptions. This is why naming is often the most important refactoring we can do to a code base, especially the removal of abbreviations that can lead to different interpretations or isomorphisms.
