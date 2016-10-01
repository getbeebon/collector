var express = require('express');
var bodyparser = require('body-parser');
var mysql = require('mysql');
var config = require('config');

var Handler = require('./lib/handler');
//var publish = require('./lib/amqp');

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

var handler = new Handler(conn);

app.post('/api/key/:key/tag/:tag', bodyparser.json(), handler.handle);
app.post('/api/key/:key/tag/', bodyparser.json(), handler.handle);
app.post('/api/key/:key', bodyparser.json(), handler.handle);
app.post('/api/key/', handler.handleError);
app.post('/api/', handler.handleError);

app.listen(config.port);