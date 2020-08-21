# HTTP API

The general URL format is `http[s]://<baseurl>/api/<version>/<object>?<param>=<value>&<param>=<value>&...`.

The API should be RESTful:
- GET - get data about '\<object\>' corresponding to parameters given in the URL
- POST - create/update '\<object\>' with data given in a JSON body
- DELETE - delete '\<object\>' corresponding to parameters given in the URL


## Coaches

The 'coaches' object supports POST, GET and DELETE.

`/api/v1/coaches`


### Create new coach (POST)

`POST /api/v1/coaches`

#### Request body

JSON object with the following fields (all required):
 - name: string
 - TODO

#### Response

TODO


### Edit coach (POST)

`POST /api/v1/coaches/<id>`

#### Request body

JSON object with the following fields (all optional):
 - name: string
 - TODO

#### Response

TODO


### Fetch all coaches (GET)

TBD

`GET /api/v1/coaches/`

#### Response

TODO


### Look up coach by ID (GET)

TBD

`GET /api/v1/coaches/<id>`

#### Response

TODO


### Delete coach (DELETE)

`DELETE /api/v1/coaches/<id>`

#### Response

TODO



## Coach matches

The 'coach-matches' object supports GET only. This corresponds to looking up coaches based on their suitability to a set of parameters.

`/api/v1/coach-matches`

### Look up coach matches (GET)

`GET /api/v1/coach-matches?<params>`

Parameters are as follows (all optional):
 - age: integer
 - gender: 'male', 'female' or 'other'
 - languages: string (a comma separated list of "\<language\>:\<proficiency\>")
 - need: integer
 - rights: integer
 - housing: integer

#### Response

JSON response, a list containing up to 10 of the best matches. Each element in the list has the following fields:
 - coach-id: integer
 - TODO \<the rest of the coach data\>
 - Match score: integer between 0 and 100
