# collector

collect data via post requests


## send data

`````
$ curl -H "Content-Type: application/json" -X POST -d \
    '{
       "type": "some type",
       "data": "some data"
     }' http://<:ip>:<:port>/api/key/<:key>/tag/<:tag>

$ curl -H "Content-Type: application/json" -X POST -d     '{
       "type": "some type",
       "data": "some data"
     }' http://localhost:3000/api/key/key1234/tag/123


`````
## send file
``````
$ curl -F file=@PATH_TO_FILE http://localhost:3000/api/file/
``````
