---
layout: post
title:  "Law of Job Title Diffusion"
date:   2020-09-01 09:00:00
categories: management
description: Explanation of a new law about job titles and there impact upon technology choices.
---

I've been trying to put into words a phenomenon that I've increasingly seen in software organisations.  This is my first attempt in describing what I've called the **Law of Job Title Diffusion**:

>> An organisations number of tools, languages, frameworks and source code repositories increases with every job title introduced.

My hypothesis is that in organisations with lower numbers of engineering job titles there are fewer programming languages, frameworks and tools in play.  The source code is also more likely to be concentrated in a smaller number of repositories.  

Imagine an engineering team where individuals do have particular talents, but work collaboratively to get work done.  Technology decisions will be taken more holistically, such as writing automated testing in the same language used to build the actual solution or using the same JSON parsing library across the board.  Thus reducing the number of languages and frameworks in play.  Furthermore, the code for solution, tests and infrastructure is more likely to live in the same source control repository.

Conversely, a team with dedicated Software Engineers in Test, Frontend Engineers and Platform Engineers is more likely to have multiple language choices (e.g. Scala for tests, Python for infrastructure, Javascript for frontend and Java for backend).  Moreover, they are also likely to store their code in different places.  For example, separate repositories for infrastructure, automated testing and source code.

Is it possible to break this law? Possibly, if job titles are seen as more consultative rather than specialisms and there is a genuine culture of solving problems together.

*Note: Sometimes different problems do require solutions, so a different language or framework might be the right choice.  However, this should be a conscious choice rather than a by-product of having different job titles!*

