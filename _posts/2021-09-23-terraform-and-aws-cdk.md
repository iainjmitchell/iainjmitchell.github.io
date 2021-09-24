---
layout: post
title:  "Terraform or AWS CDK"
date:   2021-09-08 09:00:00
categories: operability, aws
description: Comparison between the Terraform CDK and AWS CDK 
---

## Introduction
This post is the write-up of a comparison between [Terraform CDK](https://www.hashicorp.com/blog/announcing-cdk-for-terraform-0-1) and [AWS CDK](https://aws.amazon.com/cdk/). Both of these Cloud Development Kits (CDK) are new approaches to writing infrastructure-as-code.  They both provide libraries of infrastructure constructs in a variety of programming languages.  Also included are command-line tools to deploy the infrastructure.

Like traditional Terraform the Terraform CDK supports multiple cloud providers.  It also supports providers of other types of infrastructure (e.g. other CDN).  Whereas AWS CDK is only dedicated to managing AWS infrastructure.  This assessment focusses on managing only AWS infrastructure.

## What was being assessed?
1. Ease of use
    - How easy is it to use the CDK?  Any pain points or features that make the engineers life easier.
1. Ease of integration into build and deployment pipeline
    - The CDKs are executed on a build server as part of a deployment pipeline.  How easy is it to set this up?
1. Sharing of common components
    - Creating common reusable infrastructure components is an inherent feature of infrastructure-as-code.  The mechanism of sharing these can influence how much reuse actually occurs. 
1. Testing
    - How hard is it to test drive the creation of the infrastructure-as-code?
1. Code cleanliness
    - Do the patterns and design of the CDK encourage cleaner code?

## Test application
Both of the CDKs were assessed against creating the same simple application in AWS.  This was a AWS Lambda that read a message from a SQS queue and using data within sent a notification to a [Slack](https://slack.com) channel.  It also required a SQS as a Dead Letter Queue (DLQ) for repeated failed invocations.  Additionally, the Lambda needed to read the Slack API credentials from AWS parameter store. 

A summary of the architecture of the test application is in the diagram below.
![Test Application Architecture](/images/terraform-and-aws-cdk/application-architecture.png)

[TypeScript](https://www.typescriptlang.org/) was chosen as a language for both the Lambda and CDK infrastructure code.  Jenkins, self-hosted in AWS, was used as a build and deployment server. 

## Terraform CDK
### 1. Ease of use
The initial [set-up documentation](https://learn.hashicorp.com/tutorials/terraform/cdktf) made it easy to get started with the CDK.  Unfortunately, the documentation deteriorated after this point.  Context based help within the IDE pointed to the Terraform HCL documentation rather than anything based on the CDK.  Furthermore, for some queries it was not possible to find answers in the community.  This resulted in diving into the source code or applying guesswork. 

The CDK still relies upon [Terraform state files](https://www.terraform.io/docs/language/state/index.html) which need to saved to S3 as part of your stack updates.  As a disclaimer, I'm not a fan on this system up tracking infrastructure state away from the source of truth.  But a couple of times the state file became out of sync with the infrastructure in AWS.  Although, this is no different from using the Terraform HCL and you may be happy to accept this risk.

### 2. Ease of integration into build and deployment pipeline
To be able to run the CDK in Jenkins it requires a few dependencies.  As such, it was necessary to create a Docker container image (see below).
```shell
FROM node:14-alpine

RUN apk --no-cache add curl
RUN apk add --no-cache \
        python3 \
        py3-pip \
    && pip3 install --upgrade pip \
    && pip3 install \
        awscli \
    && rm -rf /var/cache/apk/*
RUN apk add terraform --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community
RUN npm install -g cdktf-cli
```
A few of these dependencies are organisation specific, but the important ones to note are:
- AWS CLI
- Terraform
- TypeScript Terraform CDK CLI (NPM package)

Additionally, Jenkins required a AWS IAM policy for access to the infrastructure that it needed to update.  This was then available to ALL jobs within Jenkins.  Although it could have been more finely controlled by utilising IAM switch role.

Overall, it took a day to get Terraform CDK running on Jenkins.  Which was hindered at times by the lack of documentation. 

### 3. Sharing of common components
Terraform CDK has a concept of scope that's passed into each of the contructors.  The scopt then becomes the current object (`this`). The LambdaFunction example below demonstrates this.  
```typescript
export class SqsSlackStack extends TerraformStack {
 constructor(scope: Construct, stackName: string, configuration: SnsSlackStackConfig) {
 super(scope, stackName);

 const lambda = new LambdaFunction(this, `${stackName}-lambda`, {..};
    }
}
```
Modularisation just requires that the scope is passed into the programming construct (e.g. Class, Factory Method).  This makes creating of independent modules straightforward.  In this case, as TypeScript is being used, these could shared through public or private [NPM](https://www.npmjs.com/).

One challenge around modularisation is that the AWS provider NPM module is a single mono-module.  As such, a module for SqsQueues still has to include _everything AWS_ in it's `node_modules`. 

### 4. Testing
At the point of implementing the application there was no unit testing support.  It was possible to test by calling `cdktf synth` in the shell and asserting on the resulting output.  This was complex and very slow to run.  

Thankfully, an update to Terraform CDK has introduced [better support for unit testing](https://www.hashicorp.com/blog/cdk-for-terraform-0-6-adds-unit-testing).  Although at the moment it appears limited to testing through [Jest](https://jestjs.io/).  As this is a new development, it is not possible to assess how usable this addition is. 

### 5. Code cleanliness
The majority of properties on the CDK classes are strongly typed.  A notable exception is that of policy documents.  These require a `string` of the policy in JSON format.  This leads to storing the policy in a file or performing an inline `JSON.stringify()` call (see below).  Neither of which lends itself to readable code.

```typescript
const inboundQueue = new SqsQueue(stack, `${stackName}-inbound`, {
 name: `${stackName}-inbound`,
 redrivePolicy: JSON.stringify({
 deadLetterTargetArn: deadLetterQueue.arn,
 maxReceiveCount: 5
    }),
 visibilityTimeoutSeconds: 60,
 tags
});
```

The `String` values with set values (e.g. Lambda runtime) are handled no differently from other `String` values.  The CDK would have benefitted from using `enum` types to help improve readability and reduce mistakes.

At times writing the CDK code felt long-winded and similar to writing Terraform HCL.  It would benefit from more abstraction of the AWS concepts.  For example,  a `addPolicy()` function on the `IamRole` class rather than creating a  `IamRolePolicyAttachment` object with the arns of the Policy and Role.  

## AWS CDK
### 1. Ease of use
Has dedicated [language specific documentation](https://docs.aws.amazon.com/cdk/api/latest/typescript/api/index.html) which mades it very easy to get started and get building.  Wider community is much bigger with more blog posts and opinions on implementing.  

Each service supported by AWS CDK is installed as a separate NPM package (e.g. [Aws Lambda](https://www.npmjs.com/package/@aws-cdk/aws-lambda)).  These each have their own documentation and independent versioning.  However, during development occassional minor version incompatibility occurred. So it is advisable to keep these package versions aligned.  

Underneath, AWS CDK is powered by [Cloudformation](https://aws.amazon.com/cloudformation/) which has two benefits.  The first is that the change set is always compared with the source of truth (AWS).  Second, changes can viewed through the Cloudformation console in AWS which can help diagnose problems.

### 2. Ease of integration into build and deployment pipeline
The [AWS CDK NPM module](https://www.npmjs.com/package/aws-cdk) contains everything required to run the AWS CDK CLI.  It can be installed from the projects package.json.  As such, there is no need for a dedicated docker container image for running in Jenkins.

Access to resources in AWS are controlled in one of two ways.  First, like Terraform CDK a policy can be assigned to the role that is executing the AWS CDK command.  Second, an independent role can be created for executing a particular stack.  In this case the Jenkins role _just_ needs access to cloudformation.  The execution role arn is passed in via the CDK command line call (see below).
```shell
cdk deploy --require-approval never --role-arn arn:aws:iam::2312431241:role/my-aws-cdk
```
Getting AWS CDK running on Jenkins was straightforward and it was working in less than an hour.

### 3. Sharing of common components
Like Terraform CDK, the AWS CDK shares the concept of a scope that is passed from Construct to Construct.
```typescript
export class NodeSqsLambda extends cdk.Construct {
 constructor(scope: cdk.Construct, id: string, configuration: SqsLambdaConfiguration) {
 super(scope, id);

 const lambdaFunction = new lambda.Function(this, id, {..});
    }
```
AWS CDK encourages the use of extending `cdk.Construct` for your own code modules.  This makes custom components consumed and interacted in through the same mechanisms as those provided by AWS.  Like Terraform CDK these modules could be easily shared via an NPM repository.

The splitting of constructs into separate NPM packages results in custom modules requiring less `node_module` baggage.   It also makes their dependencies more visible and deliberate.

### 4. Testing
AWS CDK provides [inbuilt assertions and snapshot testing capabilities](https://docs.aws.amazon.com/cdk/latest/guide/testing.html).  The assertion framework works by comparing against the yaml Cloudformation output.  The ambiguity of the outputted cloudformation makes test driving the code difficult.  This is especially difficult when there are references to other constructs by ARN. These are often rendered in a confusing manor (see `deadLetterTargetArn` below). 
```yaml
developmentservicessnsslackawsdevelopmentservicessnsslackawsinboundC75A12B7:
 Type: AWS::SQS::Queue
 Properties:
 QueueName: development-services-sns-slack-aws-inbound
 RedrivePolicy:
 deadLetterTargetArn:
 Fn::GetAtt:
            - developmentservicessnsslackawsdevelopmentservicessnsslackawsdlq3A3F2AC5
            - Arn
 maxReceiveCount: 5
 VisibilityTimeout: 60
```
### 5. Code cleanliness
The Construct Objects in AWS CDK are all strongly typed.  They also  have enums and other types to help provide correct values.  For example, a `Function` as a runtime property that has a type of `Runtime` which is a enum of accepted values (see below).  As a result, the code is clear and there is a shorter feedback loop to discovering invalid values.  This is shorter as as you don't have to apply against AWS to discover a misspelling.  
```typescript
const lambdaFunction = new lambda.Function(this, id, {
 runtime: lambda.Runtime.NODEJS_14_X,
    ...
}
```
There are objects and types for most parts of an infrastructure definition.  For example, a `Policy` is defined using `PolicyStatement` objects. 
```typescript
const ssmPolicy = new Policy(scope, `${roleName}-ssm-policy`, {
 statements: [
 new PolicyStatement({
 actions: [
 'ssm:GetParametersByPath',
 'ssm:GetParameters',
 'ssm:GetParameter'
            ],
 effect: Effect.ALLOW,
 resources: [
 'arn:aws:ssm:eu-west-1:324234234:parameter/slack/token',
 'arn:aws:ssm:eu-west-1:324234234:parameter/slack/signing-secret'
            ]
        })
    ]
});
```
Moreover, AWS CDK has abstractions in place to create links between resources.  Usually, linking a Lambda to SQS requires creation of an `EventSourceMapping` that references the two arns.  In AWS CDK the same can be achieved by calling the `addEventSource` function on the `LambdaFunction` object.
```typescript
lambdaFunction.addEventSource(new SqsEventSource(queue));
```
Finally, as mentioned AWS CDK encourages any custom components to extend `cdk.Construct`.  This results in a more unified look and feel of the codebase.

## Other thoughts
An advantage that Terraform CDK has is that it also supports other cloud and infrastructure providers.  If your organisation has multiple cloud partners and a strong desire to use the same tooling then Terraform CDK is probably for you.  

However, the Terraform CDK and AWS CDK are similar enough in their concepts that switching between the two is not jarring.  There are far more differences between AWS and Azure Terraform CDK components.  Other types of infrastructure can also be managed through alternative means.  For example, Fastly can be managed through TypeScript by using a [NPM package](https://www.npmjs.com/package/fastly).  

## Conclusion
AWS CDK is the more mature and fully featured of the two CDKs.  The high standard of documentation made it far easier to use.  Writing code was cleaner and more concise.  It was straightforward to get working on Jenkins and had more flexibility in choice of security models.  

Both CDKs supported modularisation and distribution of packages via NPM.  Though AWS CDK did encourage a more consistent approach to writing custom modules.  Unit testing is also now supported in both of the CDKs.

Even if you work in an organisation that uses different cloud providers it may be worth considering using AWS CDK.  The two CDKs are similar and it would not be too jarring to move between them (e.g. AWS CDK for AWS and Terraform CDK for Azure). 

If you are writing infrastructure-as-code for AWS then the AWS CDK is currently the better of the two.  But, if you are currently using Terraform HCL or Cloudformation you will find either of these CDKs a significant improvement.

