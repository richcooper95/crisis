# Developers

This page contains documentation aimed at developers contributing to the project, and any notes which previous developers have made along the way.

## Contents

[Security](#security)

[Hosting](#hosting)



## Security

### General

* From a data reading perspective, there isn't much to be concerned about since we can anonymise the data stored in the database and the JSON message bodies.
* There are never any full names stored in the coach database - a Coach ID would be sufficient, perhaps with a first name for manual identification by the user.
* The DoB would be useful to store in the database, since we can then dynamically categorise them into age buckets when matching with a member (whose data contains an age bucket).
  * Is this (plus a first name) too much personal data?
* The database itself would only be accessible via the app (hidden).
* However, if anyone can access the web app, they could add/remove spam entries to the database!

### Users

* Single credentials used by all users would be easier to implement as a first pass.
* Possible issue with needing to change the password once someone leaves the charity?
* Only give credentials to as few people as possible?

### Authentication



### HTTP/HTTPS


## Hosting

### AWS



## Database



## Front End

The front end is written in React.js.

## Server


