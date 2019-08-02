---
layout: post
title:  "Acceptance Testing"
date:   2019-07-31 10:39:51
categories: testing, software management
description: Thoughts on current state of acceptance testing
---

Last week I had the following DM on Twitter from [@rahabm](https://twitter.com/rahabm) about the current state of Acceptance Testing

>>> Hi Iain. I remember that testing used to be taken serious back in the UK. What is the current state on Acceptance Testing these days ? What are your thoughts on who should write and implement an acceptance test ? 😀
I commented at the end of my rant back to @rahabm that I should probably write a blog post about this, so here it is!

To begin with, what do we mean by **Acceptance Test**?  If we use [Mike Cohn's Testing Pyramid](https://martinfowler.com/bliki/TestPyramid.html) we are referring to the User Interface or system boundary test, which is the very top of the pyramid.  For a website this would be a form of browser automation with code performing the clicks and inputting normally performed by humans.

As the **Testing Pyramid** suggests, we should write as few of these as possible.  They are time consuming to write, maintain and run, plus have a much slower feedback loop than unit tests.  If there are too many of these they can impact a teams cadence of delivery and discourage continuous integration.

**Acceptance Tests** should focus on critical user journeys rather than specific functionality.  For example, for an e-commerce site you would expect there to be an **Acceptance Test** that selects a number of items and completes payment.  They are also usually focussed upon positive outcomes, rather than *xyz* failed.

## Who should write Acceptance Tests?

Some organisations have dedicated people, sometimes called *Software Engineers in Test*, to write **Acceptance Tests**.  I would suggest not doing this as:
1. It will encourage more of these tests to be written, as it helps to occupy this persons time.
1. Often this person will work by themselves, becoming a bottleneck and a [bus factor of one](https://en.wikipedia.org/wiki/Bus_factor).  
1. They may follow different coding practices and/or languages than the rest of the engineering team.  I have seen entire test suites thrown away when the test engineer leaves the team for this reason.

A preferable solution is to employ a QA who thinks about quality in the system holistically and works with the engineering team to work out how to test it better.  This person is NOT primarily a coder, but is happy to pair or join a mob with engineers to ensure quality.