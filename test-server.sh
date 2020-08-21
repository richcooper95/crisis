#!/usr/bin/env bash


echo "List empty DB"
curl localhost:8000/api/v1/coaches
echo

echo "Create coaches"
curl -H "Content-Type: application/json" -d '{"name":"Bob"}' localhost:8000/api/v1/coaches
echo
curl -H "Content-Type: application/json" -d '{"name":"Albert"}' localhost:8000/api/v1/coaches
echo
curl -H "Content-Type: application/json" -d '{"name":"Marie"}' localhost:8000/api/v1/coaches
echo
curl -H "Content-Type: application/json" -d '{"name":"Kelly"}' localhost:8000/api/v1/coaches
echo

echo "List DB"
curl localhost:8000/api/v1/coaches
echo

echo "Get coach by ID"
curl localhost:8000/api/v1/coaches/1
echo

echo "Modify coach"
curl -H "Content-Type: application/json" -d '{"name":"Kelly S."}' localhost:8000/api/v1/coaches/3
echo

echo "Remove coach"
curl --request DELETE localhost:8000/api/v1/coaches/0


echo "List DB"
curl localhost:8000/api/v1/coaches
echo

