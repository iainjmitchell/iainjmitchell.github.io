---
layout: post
title:  "Release and Deployment"
date:   2021-09-08 09:00:00
categories: operability
description: How automation and trust guide our approach to release and deployment of software 
---
First a question, 
> What do you want your software release and deployment process to be like? 

If you had no constraints from your organisation what would it look like?

There are two predominant factors around release and deployment:
1. Automation - How much do you _want_ to automate?  On one side of the scale is a manual release process with no automation.  At the opposite end of the scale is  everything automated with few (if any) manual gates .  This is would involve automation of deployment, testing, security scans,  automatic rollbacks etc.
1. Trust - There are two elements of Trust. The first is how much the organisation trusts the product teams?  Do they have change approval boards and release windows. Or do they trust the team to deploy whenever they choose?  The second consideration is how much trust there is within the team.  Is the team confident that everyone will conform to standards and guidelines?  Or is trust lower that means that it requires a more formal process?

Using these two factors we can make a axis for comparing different approaches to software release and deployment.

![Axis for automation v trust](/images/release-and-deployment/trust-and-automation.png)

Looking at this axis can you pinpoint where your attitude to release and deployment lies?  Do you have a preference towards more manual gates (lower trust)?  And how much do you expect to happen without human intervention (automation level)?

Onto these axis I have placed well known techniques for release and deployment of software.
![Techniques](/images/release-and-deployment/techniques.png)

Let me explain by reasoning behind these placements....

### Change Approval Board (CAB) and Manual Deploy
In the bottom corner is a situation with CABs and little done to automate the deployment process.  The need for approval is an indicator that there is an expectation that the team will break the product.  Which demonstrates a low level of trust in the abilities and professionalism of the team.  

The throttling of releases by this approval discourages the team from automating.  Control of access to environments may even prevent the running of automation.

### Pull Requests (PR) on Feature Branches
This is often a situation where there is more automation. For example, there is often a build server that runs when integration occurs.  Trust appears higher within the organisation as auditable PR reduces need for wider approval.  Yet, the enforced PR itself demonstrates a lower level of trust within the team itself.  Which is _exactly_ the intent of PRs.  

In Open Source project you don't know who is working on your project. Having an enforced review process might be a good idea, [especially if you don't want to spread Malware](https://www.theregister.com/2018/11/26/npm_repo_bitcoin_stealer/). The downside to this is a culture of lower trust. This can lead to dominant people becoming the arbiters of what is 'good' for the codebase.  Furthermore, having system barriers that prevent pushing to mainline impacts trust.  This result in lower empowerment and frustration (i.e. needing to create a branch and PR for a README change). 

### Continuous Integration (CI)
[Martin Fowler's post about CI](https://martinfowler.com/articles/continuousIntegration.html) is well worth a read as it clears up  many misconceptions about CI. A common misconception is that you are _doing_ CI if you have a build server.

Continually Integrating involves the team regularly pushing/merging code to mainline.  Thus, it is essential to have automation around build and running of tests.  Furthermore, it also demonstrates a higher level of trust within the team.  As they are trusting that any agreed practices (e.g. peer review, standards) are happening.

Yet, there is not absolute trust as gates remain to testing and/or production.  This could originate from the organisation, team or a combination of both.  These gates also make it unlikely that the team will pursue further automation.  Such as full deployment pipelines, security scans and in-live testing.  It is also feasible that the deployment to other environments could still be manual.

### Continuous Delivery (CD)
CD is the [ability to release to production at anytime](https://www.martinfowler.com/bliki/ContinuousDelivery.html).  An interesting facet of this is that mainline has to constantly be in a releasable state.  This requires higher trust within the team and organisation.  As both would need reassuring that releases will not cause impact to customers.  Furthermore, the move to CD will also increase the level of automation.  This could include: full deployment pipelines, security scanning and monitoring of production environment.

### Continuous Deployment (CDP)
In the top corner in the zone of high trust and automation is CDP. Every code push/merge to mainline is deployed automatically to production.  Reaching this point requires a high level of organisation and team trust. There is no gate to deployment and engineers are trusted to avoid customer outages.  

Accompanying this is an automate everything approach to software release and deployment.  Which may include in-live testing, service observability and automatic rollbacks when deployments fail.

## Conclusion
The approach to software release and deployment is as much as about **trust** as it is about **automation**.  The level of trust can be determined at both the organisation and team level.  As it is possible to have an organisation with absolute trust but a team who feel they need to impose gates.

The post also ran through where many software release and deployment techniques lie on the axis of trust and automation.  This can be used to help understand why a particular technique has been chosen.  Or determine an appropriate strategy for release and deployment. 