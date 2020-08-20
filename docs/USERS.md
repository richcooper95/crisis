# Users

This page contains documentation aimed at users of the tool. It may also be useful for developers from an FS perspective.

## Contents

[Overview](#overview)
[Coach Database](#coach-database)
[Actions](#actions)
[Future Work](#future-work)

___

## Overview

The web app provides an internal-only mapping and tracking tool which links new members with the best-fit Coach.

___

## Coach Database

The heart of the app is a database containing information about all Coaches currently working at Crisis.

### Coach Data

The data stored about each of the Coaches is as follows:

1. **Coach ID**
    1. This is a unique ID used to identify the Coach in the Crisis organisation.
1. **Available**
    1. Whether or not the Coach is currently available to be assigned new Members.
1. **First Name**
    1. This is included since it may be sufficient for identifying the Coach without needing to look up the Coach ID.
    1. _@@@ The last name may also be included if sufficient authentication is provided by the app._
1. **Date of Birth**
    1. This is used to calculate the Coach's age bracket to compare with that of the Member.
    1. _@@@ If the exact date is too much personal info then just the year is sufficient as an approximation._
1. **Languages**
    1. A list of languages spoken by the Coach, in order of proficiency.
1. **Level of Need**
    1. The types of need level that the Coach is experienced with. This is a list of levels selected from the list described above.
1. **Rights Status**
    1. The types of rights status that the Coach is experienced with. This is a list of levels selected from the list described above.
1. **Housing Status**
    1. The types of housing status that the Coach is experienced with. This is a list of levels selected from the list described above.
1. **Personal Bio**
    1. A short bio written by the Coach, including any information about them which may make a assignment a better/more personal fit.
    
___

## Actions

The web app interface is navigated via a sidebar, and allows the user to manipulate the database of Coaches, and assign a Coach to a new Member.

The sidebar options are each associated with one of the following actions.

### Assign Coach

This section allows users to assign a Member to a Coach.

It contains a form for the user to fill out with details about the new Member. After submitting the form, the 10 best-fit Coaches for the Member are returned to the user in
order.

#### Form

The form contains the following fields:

1. **Age Group**
    1. The Member's age group.
    1. _@@@ The form may be changed to include a text box for the user to enter the exact age of the Member, so that the absolute difference between the Member and Coach
       ages can be used to sort on during the algorithm?_
1. **Gender**
    1. The Member's identified gender.
1. **Languages**
    1. The languages spoken by the Member, in order of proficiency. Multiple languages may be selected.
1. **Level of Need**
    1. The Member's level of need. This is rated on a scale from 1-6 as follows:
        1. No intervention necessary.
        1. Signpost to other resources.
        1. Information, advice and guidance (IAG).
        1. Coaching and skills.
        1. Coaching engagement skills.
        1. Intensive support needed.
1. **Rights Status**
    1. The Member's rights status in the UK. This is rated on a scale from 1-2 as follows:
        1. No intervention necessary.
        1. No recourse to public funds.
1. **Housing Status**
    1. The Member's current housing status. This is rated on a scale from 1-4 as follows:
        1. No intervention necessary.
        1. At risk of homelessness.
        1. Unsuitable temporary accommodation.
        1. Rough sleeping.

After submitting the form, the page will load the top 10 best-fit available Coaches in order. The information about each Coach will be visible to the user to allow them to
make a more personalised assignment if applicable, including a short 'Notes' section written by the Coach to capture any relevant information not usable in the matching
algorithm.

#### Matching Algorithm
 
All of the [Coach data](#coach-data) except for the Personal Bio is used in the matching algorithm.

The algorithm is yet to be determined, but must meet the following criteria:

1. Return a list of all Coaches in the database ordered by how well they match the given Member.
1. Language matching must taken into account proficiency with all languages present, maximising proficiency for both the Coach and the Member.
    1. _@@@ A numerical proficiency score is preferable algorithmically, but harder to implement with a good UI! (Proficiency score could be a separate field in the UI, for
       the user to enter the proficiency scores in order - but seems a little convoluted! Ideally there'd be a way to enter the proficiency next to each language as it's been
       selected - either a text box, or a sliding scale.)_
1. Preference for a close match in age.
1. Preference for the same gender.
1. A strong weight should be given to expertise in Level of Need and a matching language.
1. A medium weight should be given to expertise in Housing Status and Rights Status.
1. A low weight should be given to age and gender.

### Add Coach

This section contains a form for the user to fill out with details about the Coach. After submitting the form, the Coach is added to the database.

The fields in the form are the same as in the [Coach Data](#coach-data) section.

### Search/Edit Coaches

This section contains a form consisting of all of the fields in [Coach Data](#coach-data) but allowing the form to be only partially filled.

The submission of the form searches the database for all matching records, and all which are considered to match are returned to the user.

Alongside each entry, an option to **Edit** or **Remove** it is provided.

#### Edit

A form is presented containing the same fields as in the [Add Coach](#add-coach) section (pre-filled with the data for the given Coach). The user may then make any
changes they desire (except for Coach ID, which is greyed out and may not be altered once assigned to preserve uniqueness) and then save the changes to the database.

#### Remove

A confirmation box appears to ensure that this was intentional. If the user confirms they wish to delete the entry, the Coach is removed from the database.

___

## Future Work

1. Ensure the app is secure with HTTPS and authentication.
1. Add the ability to record which Members are currently assigned to which Coach (or at least a count of how many Members are assigned to each Coach).
1. 
