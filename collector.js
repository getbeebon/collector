
var express = require('express');
var bodyparser = require('body-parser');
var mysql = require('mysql2');
var config = require('config');
var Joi = require('joi');
var console = require('tracer').colorConsole();

var Handler = require('./lib/handler');
var configSchema = require('./lib/configSchema');

var Amqp = require('./lib/amqp');

Joi.validate(config, configSchema, function (err, config) {
    if (err) {
        console.log(err);
        process.exit(1);
    } else {
        var app = express();
        var conn = mysql.createConnection(config.mysql);
        var amqp = new Amqp(config);

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

        var handler = new Handler(conn, amqp);

        app.post('/api/key/:key/tag/:tag', bodyparser.json(), handler.handle);
        app.post('/api/key/:key/tag/', bodyparser.json(), handler.handle);
        app.post('/api/key/:key', bodyparser.json(), handler.handle);
        app.post('/api/key/', handler.handleError);
        app.post('/api/', handler.handleError);

        app.listen(config.collector.port, function(){
            console.log('start');
        });

    }
});