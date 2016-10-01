var express = require('express');
var bodyparser = require('body-parser');
var mysql = require('mysql');
var publish = require('./amqp');
var config = require('config');

var app = express();

var conn = mysql.createConnection(config.mysql);

function handleDisconnect(connection) {
    connection.on('error', function (err) {
        if (!err.fatal) {
            return;
        }
        if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
            throw err;
        }
        console.log('Re-connecting lost connection: ' + err.stack);
        conn = mysql.createConnection(connection.config);
        handleDisconnect(conn);
        conn.connect();
    });
}

handleDisconnect(conn);

var handleRequest = function (req, res) {
    var key = req.params.key;
    var tag = (req.params.tag) ? req.params.tag : '';
    var body = req.body;
    var payload = JSON.stringify(body);

    //console.log(body);
    console.log(payload);

    if (payload) {
        conn.query('INSERT INTO ' + key + " (`tag`,`payload`) VALUE('" + tag + "','" + payload + "')", function (err) {
            if (err) {
                console.log("err",err);
                res.status(400).json({result: 'fail', description: 'no key'});
            } else {
                if (key == 'mobilon24') {
                    publish("beebon_" + key, payload);
                }

                res.status(200).json({result: 'success'});
            }
        });
    } else {
        res.status(400).json({result: 'fail', description: 'not valid json'});
    }
};

var handleErrorRequest = function (req, res) {
    res.status(400).json({result: 'fail', description: 'no key'});
};

app.post('/api/key/:key/tag/:tag', bodyparser.json(), handleRequest);
app.post('/api/key/:key/tag/', bodyparser.json(), handleRequest);
app.post('/api/key/:key', bodyparser.json(), handleRequest);
app.post('/api/key/', handleErrorRequest);
app.post('/api/', handleErrorRequest);

app.listen(config.port);