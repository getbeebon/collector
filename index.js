var express = require('express');
var bodyparser = require('body-parser');
var mysql = require('mysql2');
var Joi = require('joi');
var console = require('tracer').colorConsole();

var Handler = require('./lib/handler');
var configSchema = require('./lib/configSchema');

var Amqp = require('./lib/amqp');
var Kue = require('./lib/kue');

var server = function (config) {

    var app, conn, amqp, kue;

    var init = function (config) {
        app = express();
        conn = mysql.createConnection(config.mysql);
        amqp = new Amqp(config);
        kue = new Kue(config, conn);

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

        var handler = new Handler(conn, amqp, kue, config);
        app.use(bodyparser.json());

        app.post('/api/key/:key/tag/:tag', handler.handle);
        app.post('/api/key/:key/tag/', handler.handle);
        app.post('/api/key/:key', handler.handle);
        app.post('/api/key/', handler.handleError);
        app.post('/api/', handler.handleError);

        app.post('/api/log/:key/tag/:tag', handler.handle);
        app.post('/api/log/:key/tag/', handler.handle);
        app.post('/api/log/:key', handler.handle);
        app.post('/api/log/', handler.handleError);

        app.post('/api/task/:key/tag/:tag', handler.handleTask);
        app.post('/api/task/:key/tag/', handler.handleTask);
        app.post('/api/task/:key', handler.handleTask);
        app.post('/api/task/', handler.handleError);
    };

    Joi.validate(config, configSchema, function (err, config) {
        if (err) {
            console.log(err);
            process.exit(1);
        } else {
            init(config);
        }
    });

    var run = function () {
        app.listen(config.collector.port, function () {
            console.log('start');
        });

    };

    return {
        run: run
    };
};

module.exports = server;