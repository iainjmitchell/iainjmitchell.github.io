---
layout: post
title:  "Drop Down Lists in ASP.NET MVC 2"
date:   2010-07-07 13:09
categories: .NET, ASP.NET MVC
description: Working with Drop Down Lists in ASP.NET MVC 2.
---

A problem that I have come across recently is, how do you handle drop down lists in MVC? There is a dual function of the MVC model as it has to:

1) Provide the data to populate the drop down list (the **display name** and **value**)

2) Capture the **selected value** when being submitted back to the controller.

For example, lets say we want the user to select their favourite A-Team member. We want to display the list of A-Team names (B.A, Face, Murdoch, Hannibal) but we want the value sent back to the controller to be the selected actors name (e.g. B.A. returns Mr T).

So, how do we achieve this?

First of all we need to include a collection on out model to contain the details of our A-Team members.  We also need to add an extra property that holds the selected actor.

```csharp
public class ATeamMember
{
   public string Name {get; set;}
   public string ActorName {get; set;}
}

public class ATeamModel
{
  public IEnumerable Members {get; set;}

  [DisplayName("Pick your favourite A-Team member")]
  public string SelectedActor {get; set;}
}
```

Then we can build our initial controller actions to retrieve the initial view data and our action to handle the submitted data back from the view.

```csharp
public class ATeamController
{
   public ActionResult Favourite()
   {
        var members = new List();
        members.Add(new ATeamMember(){Name = "B.A.", ActorName = "Mr T"});
        members.Add(new ATeamMember(){Name = "Hannibal", ActorName = "George Peppard"});
        members.Add(new ATeamMember(){Name = "Face", ActorName = "Dirk Benedict"});
        members.Add(new ATeamMember(){Name = "Murdock", ActorName = "Dwight Schultz"});
        var model = new ATeamModel()
        {
           Members = members
        };
        return this.View(model);
   }

   [HttpPost]
   public ActionResult Favourite(ATeamModel model)
   {
       if (model.SelectedActor == "Mr T")
       {
           this.RedirectToRoute("PityTheFool");
       }
       else
       {
           .......
       }
   }
}
```

Notice, that we are not setting the **SelectedActor** property on model send from the initial request.  But we are assuming that this has been set on the post back method.

Finally, we need to construct our view that will display the drop down list and populated the **SelectedActor** on the model submitted by the view.

This is achieved by using the Html helper **Html.DropDownListFor()**.  It takes two arguments, the first of which is a Lambda that expresses which property on the model that the drop down list selected value relates to (in this case **SelectedActor**).  The second argument is a [SelectList](http://msdn.microsoft.com/en-us/library/system.web.mvc.selectlist.aspx) that contains the data, which in this case I am constructing by using the **Members** collection on my model.  The next two arguments on it’s constructor tell the SelectList which properties of the items to use as the Value and Display Text (in this case **ActorName** and **Name** respectively). The final value on the constructor links back to the field in the model to populate with the select value.

```html
<%@ Page Title=”" Language=”C#” Inherits=”System.Web.Mvc.ViewPage<MyATeamApp.Models.ATeamModel>” %>
<asp:Content ID=”Content1″ ContentPlaceHolderID=”MainContent” runat=”server”>
  <fieldset>
    <div>
    <%= Html.LabelFor(m => m.SelectedActor) %>
    <%= Html.DropDownListFor(m => m.SelectedActor,
      new SelectList(Model.Members, “ActorName”, “Name”, Model.SelectedActor)) %>
    </div>
    <input type=”submit” value=”Confirm” />
  </fieldset>
</asp:Content>
```

So, this is our complete MVC 2 Drop down list. Though there is one final word of caution.

When the model is sent back from our view to the controller the **SelectedActor** is populated, but the **Members** collection will now be **null**. This is because the data from the list has not been reattached to the incoming model on the view. Of course, in most cases this won’t be an issue as you probably only care about the selected value.

But it could impact what happens on an validation errors, as usually the user would be sent back to the page to correct the error. So, this may require the re-population of the **Members** collection on the model before sending it back.
