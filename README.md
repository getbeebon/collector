# collector

collect data via post requests


## send data

`````
$ curl -H "Content-Type: application/json" -X POST -d \
    '{
       "type": "some type",
       "data": "some data"
     }' http://<:ip>:3000/api/key/<:key>/tag/<:tag>

`````