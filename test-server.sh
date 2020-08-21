#!/usr/bin/env bash

set -e


coach_json () {
  echo """{
    \"name\": \"$1\",
    \"bio\": \"$2\",
    \"available\": true,
    \"birth_year\": $3,
    \"gender\": \"$4\",
    \"languages\": {$5},
    \"need\": [1, 2, 3],
    \"rights\": [2],
    \"housing\": [3]
  }"""
}


echo "List empty DB"
echo "-------------"
curl localhost:8000/api/v1/coaches
echo
echo

echo "Create coaches"
echo "--------------"
curl -H "Content-Type: application/json" -d "$(coach_json Bob 'Hey, Bob here.' 1992 male '"english":1,"spanish":4')" localhost:8000/api/v1/coaches
echo
curl -H "Content-Type: application/json" -d "$(coach_json Albert '' 1990 other)" localhost:8000/api/v1/coaches
echo
curl -H "Content-Type: application/json" -d "$(coach_json Kelly '' 1988 female)" localhost:8000/api/v1/coaches
echo
curl -H "Content-Type: application/json" -d "$(coach_json Susan '' 1993 female)" localhost:8000/api/v1/coaches
echo
curl -H "Content-Type: application/json" -d "$(coach_json Mike '' 1970 male '"spanish":1,"french":2')" localhost:8000/api/v1/coaches
echo
echo

echo "List DB"
echo "-------"
curl localhost:8000/api/v1/coaches
echo
echo

echo "Get coach by ID"
echo "---------------"
curl localhost:8000/api/v1/coaches/1
echo
echo

echo "Modify coach"
echo "------------"
curl -H "Content-Type: application/json" -d '{"name":"Kelly S."}' localhost:8000/api/v1/coaches/2
echo
echo

echo "Remove coach"
echo "------------"
curl --request DELETE localhost:8000/api/v1/coaches/3
echo
echo


echo "List DB"
echo "-------"
curl localhost:8000/api/v1/coaches
echo
echo


echo "Coach matches for birth_year=34, languages=english:2, gender=male"
echo "-----------------------------------------------------------------"
curl "localhost:8000/api/v1/coach-matches?birth_year=1990&languages=english:2&gender=male"
echo
echo

