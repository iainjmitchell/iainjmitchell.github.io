---
layout: post
title:  "Implementing the Specification Pattern in .NET"
date:   2011-04-15 08:43
categories: .NET, Design Patterns
description: How to implement the specification pattern in .NET.
---

Recently I have been reading Eric Evans excellent book on [Domain Driven Design](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215).  One of the patterns discussed in this book is the **Specification Pattern**, which was conceived by Eric Evans and Martin Fowler (see [here](https://www.martinfowler.com/apsupp/spec.pdf) for full description).

This pattern is about encapsulating domain rules into specification classes.  These are then used to test if a particular domain object satisfies the criteria. Typically, they expose a public function called **IsSatisifiedBy()** that returns a boolean based on whether the object satisfies the specification.

For example, if we have a bank account value object…

```csharp
public class BankAccount
{
   public int CurrentBalance( get; set;}
}
```

..we may define a specification to test whether the bank is overdrawn…

```csharp
public interface ISpecification
{
  bool IsSatisfiedBy(BankAccount account);
}

public class AccountOverdrawnSpecification: ISpecification
{
  public bool IsSatisfiedBy(BankAccount account)
  {
     return (account.CurrentBalance < 0);
  }
}
```

..which can then be used in our code.

```csharp
ISpecification overdrawnSpecification = 
  new AccountOverdrawnSpecification();

var account = new BankAccount(){ CurrentBalance = -10};
if (overdrawnSpecification.IsSatisfiedBy(account))
{
  throw new AccountOverdrawnException();
}
```

The main advantage of this pattern is that any logical decisions within the code will be based upon language the customer would understand.  It also makes the code more readable, which will benefit other developers when they need to understand the system.

An additional feature of this pattern is that the specifications can be 'chained' using boolean logic to create more complex specifications.  Below is an example of this in action:

```csharp
ISpecification complexSpecification = 
  new AccountOverdrawnSpecification().And(
    new AccountEmptySpecification().Or(new AccountValueSpecification()));

var account = new BankAccount(){ CurrentBalance = -10};
if (complesSpecification.IsSatisfiedBy(account))
{
  throw new AccountException();
}
```

So, how do we implement this in .NET?  Fortunately, generics and extension methods allow us to provide a set of classes that are flexible enough to meet the requirements of this pattern under most circumstances.

First of all, we should amend the **ISpecification** interface to be type safe by making it a generic interface:

```csharp
public interface ISpecification<TEntity>
{
  bool IsSatisfiedBy(TEntity entity);
}
```

Then we need to define the helper classes that allow us to perform the boolean comparisons (AND, OR and NOT). Below is the code for the **AndSpecification** class:

```csharp
internal class AndSpecification<TEntity> : ISpecification<TEntity>
{
  private ISpecification<TEntity> _specificationOne;
  private ISpecification<TEntity> _specificationTwo;

  internal AndSpecification(ISpecification<TEntity> specificationOne, 
    ISpecification<TEntity> specificationTwo)
  {
    this._specificationOne = specificationOne;
    this._specificationTwo = specificationTwo;
  }

  public bool IsSatisfiedBy(TEntity entity)
  {
    return (this._specificationOne.IsSatisfiedBy(entity) && 
      this._specificationTwo.IsSatisfiedBy(entity));
   }
}  
```

Finally we need to enable the chaining functionality on objects that implement **ISpecification** by writing extension methods for And(), Or() and Not(), like this:

```csharp
public static class SpecificationExtensionMethods
{        
  public static ISpecification<TEntity> And<TEntity>(
    this ISpecification<TEntity> specificationOne,
    ISpecification<TEntity> specificationTwo)
  {
    return new AndSpecification<TEntity>(
      specificationOne, specificationTwo);
  }

  public static ISpecification<TEntity> Or<TEntity>(
    this ISpecification<TEntity> specificationOne,
    ISpecification<TEntity> specificationTwo)
  {
     return new OrSpecification<TEntity>(
       specificationOne, specificationTwo);
  }

  public static ISpecification<TEntity> Not<TEntity>(
    this ISpecification<TEntity> specification)
  {
    return new NotSpecification<TEntity>(specification);
  }
}
```

Now, any specifications we want to define must inherit from the new generic interface.  Here is a refactor of the AccountOverdrawnSpecification:

```csharp
public class AccountOverdrawnSpecification: ISpecification<BankAccount>
{
  public bool IsSatisfiedBy(BankAccount entity)
  {
     return (entity.CurrentBalance < 0);
  }
} 
```

That is all we need to do in order to implement this pattern in a reusable manor in .NET.  I have attached a visual studio solution below that contains a class library implementing this pattern and a demonstration console application.

[Specification Pattern (Visual Studio 2010 Solution)](/downloads/SpecificationPattern.zip)
