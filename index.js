var express = require('express');
var bodyparser = require('body-parser');
var multipart = require('connect-multiparty');
var Joi = require('joi');
var basicAuth = require('basic-auth');

var console = require('tracer').colorConsole();

var Handler = require('./lib/handler');
var configSchema = require('./lib/configSchema');

var Kue = require('./lib/kue');
var Db = require('./lib/db');

var server = function (config) {

    var app, db, kue;

    var init = function (config) {
        app = express();
        db = new Db(config);
        kue = new Kue(config, db);

        var handler = new Handler(db, kue, config);
        app.use(bodyparser.json());

        //auth
        app.use(function (req, res, next) {
            var auth = config.auth;
            if (auth.ip.test(req.ip)) {
                next();
            } else {
                var user = basicAuth(req);
                if (user && user.name == auth.user && user.pass == auth.pass) {
                    next();
                } else {
                    res.sendStatus(403)
                }
            }
        });

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

        app.post('/api/file/', multipart(), handler.handleFile);

        app.get('/api/task/:key/status/:id', handler.handleStatus)
    };

    Joi.validate(config, configSchema, {allowUnknown: true}, function (err, config) {
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