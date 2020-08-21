# HTTP API

The general URL format is `http[s]://<baseurl>/api/<version>/<object>?<param>=<value>&<param>=<value>&...`.

The API should be RESTful:
- GET - get data about '\<object\>' corresponding to parameters given in the URL
- POST - create/update '\<object\>' with data given in a JSON body
- DELETE - delete '\<object\>' corresponding to parameters given in the URL


## Coaches

The 'coaches' object supports POST, GET and DELETE.

`/api/v1/coaches`

The JSON fields used to represent a coach are as follows:
 - name: string
 - bio: string
 - available: boolean
 - birth_year: integer
 - gender: string ('male', 'female' or 'other')
 - languages: object {\<language\>:string: \<proficiency\>:integer}
 - need: list \[integer\]
 - rights: list \[integer\]
 - housing: list \[integer\]


### Create new coach (POST)

`POST /api/v1/coaches`

#### Request body

JSON object with fields from the coach representation (all *required*).

#### Response

JSON object with the following fields:
 - \<all fields from the coach representation\>
 - id: integer


### Edit coach (POST)

`POST /api/v1/coaches/<id>`

#### Request body

JSON object with any fields from the coach representation (all *optional*).

#### Response

JSON object with the following fields:
 - \<all fields from the coach representation\>
 - id: integer


### Fetch all coaches (GET)

`GET /api/v1/coaches/`

#### Response

List of JSON objects with the following fields:
 - \<all fields from the coach representation\>
 - id: integer


### Look up coach by ID (GET)

`GET /api/v1/coaches/<id>`

#### Response

JSON object with the following fields:
 - \<all fields from the coach representation\>
 - id: integer


### Delete coach (DELETE)

`DELETE /api/v1/coaches/<id>`

#### Response

Empty.



## Coach matches

The 'coach-matches' object supports GET only. This corresponds to looking up coaches based on their suitability to a set of parameters.

`/api/v1/coach-matches`

### Look up coach matches (GET)

`GET /api/v1/coach-matches?<params>`

Parameters are as follows (all *optional*):
 - birth_year: integer
 - gender: string ('male', 'female' or 'other')
 - languages: string (a comma separated list of "\<language\>:\<proficiency\>")
 - need: integer
 - rights: integer
 - housing: integer

#### Response

A list of JSON objects in order of match score. Each element in the list has the following fields:
 - \<all fields from the coach representation\>
 - id: integer
 - match_score: integer
