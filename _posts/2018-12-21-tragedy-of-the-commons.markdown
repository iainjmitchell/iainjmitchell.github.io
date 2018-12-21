---
layout: post
title:  "Tragedy of the Commons"
date:   2018-12-20 10:39:51
categories: systems thinking, agile, software management, logging
description: Explanation of Tragedy of the Commons through a real world example 
---

Recently my team was contacted by the centralised infrastructure group to discuss our use of the organisations [Sumo Logic](https://www.sumologic.com/) account. We utilise Sumo Logic to store and explore some of our application logs. These can be quite large due to the high volume of traffic that our APIs handle.

We were being contacted because the centralised Sumo Logic account was reaching the contractual storage limit. They were attempting to encourage the teams who used it to reduce their log generation. This is an example of **Tragedy of the Commons** which I will talk about in this post.

The phrase first appeared in a pamphlet written in 1833 by a gentleman called William Forster Lloyd. He was an economist of the [Malthusian](https://en.wikipedia.org/wiki/Malthusianism) tradition, typically obsessed with the use of resources and the impact of population growth upon them.

This pamphlet used the example of overgrazing on the Commons in English towns and villages to explore the rationality of individual economic decisions. The Commons were areas of land in the settlement that belonged to no one. Therefore, everyone was entitled to let their cow, sheep, donkey etc. forage on this ground. Everyone could get an economic benefit of using these grounds, but too much use by everyone could result in depletion or destruction of the Common.

Ecologist [Garrett Hardin](https://en.wikipedia.org/wiki/Garrett_Hardin) picked up this idea in his essay on Tragedy of the Commons. He pessimistically predicted that the herdsperson would always choose to keep adding animals to the Common ground. This was based on the rationale that the herdsperson would always benefit from the animal being on the Commons and they would share any negative consequences. Furthermore, through the lens of human population and the impact upon the planets resources he asserted that to avoid depletion common resources have to be managed.

Consequentially many ecological and environmental issues were viewed as examples of Tragedy of the Commons. Examples of this include overfishing, pollution and global warming.

This led to [Donella Meadows](https://en.wikipedia.org/wiki/Donella_Meadows) identifying Tragedy of the Commons as a system trap in her (highly recommended) book [‘Systems Thinking A Primer’](https://www.goodreads.com/book/show/3828902-thinking-in-systems). It is asserted that trap is caused by _‘missing (or too long delayed) feedback from the resource to the growth of the users of that resource’_ (Meadows, p117). Fortunately, it identifies three ways to avoid this trap:

* **Educate and Exhort** — Inform people about the consequences of their action, shame those who don’t conform.
* **Privatise the Commons** — give everyone their own section, so everyone suffers the consequences of their own actions.
* **Regulate the Commons** — Quotas, permits, taxes etc.

Returning to our Sumo Logic problem, it seems that what our friends in the centralised infrastructure team are attempting to do is **educate** the teams on the consequences of their actions. They have not tried to socially shame those who are using large quantities of the shared resource. Though I’m not sure this would be great for the culture of the organisation.

An alternative would be to explore **regulation** as a solution to the problem. Each team could be provided with a quota for Sumo Logic, perhaps with internal fines if they exceed this. Or internal budgeting could be used, with each team/department being charged for their use of the shared Sumo Logic account.

The final option is **privatisation** of the shared resource. This could mean setting up individual Sumo Logic accounts for all of the teams, or using their own log exploration solution. The difficulty with this option is encouraging teams who currently pay nothing for logging to voluntarily take on these costs.

What is our team’s strategy in dealing with this problem? From similar problems in the organisation in the past, such as shared Continuous Integration servers and centralised API management, the logical solution is to **privatise** our use of the common resource. We have already been moving many of our APIs and products over to using [Cloudwatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html) in our AWS accounts. Though the downside of this is that we are now increasing our own AWS costs.

What would I recommend to the centralised infrastructure team? It is necessary for the teams to feel incentivised to move away from the centralised Sumo Logic account. This could be achieved through providing teams who leave a budget increase equal to their current cost of their Sumo Logic footprint. Alternatively, a charge or fine could be applied to each team for their Sumo Logic use.

Regardless though of the solution, **privatisation** of this shared resource seems the best solution for this case of Tragedy of the Commons.


> Meadows, D. (2008). Systems Thinking A Primer, Chelsea Green Publishing