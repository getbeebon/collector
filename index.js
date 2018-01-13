const express = require('express');
const bodyparser = require('body-parser');
const multipart = require('connect-multiparty');
const Joi = require('joi');
const console = require('tracer').colorConsole();
const basicAuth = require('express-basic-auth')

const Handler = require('./lib/handler');
const configSchema = require('./lib/configSchema');

const Kue = require('./lib/kue');
const Db = require('./lib/db');

const server = (config) => {

    let app, db, kue;

    let init = (config) => {
        app = express();

        db = Db(config);
        kue = Kue(config, db);

        let handler = Handler(db, kue, config);
        app.use(bodyparser.json());

        //auth
        if (config.auth && config.auth.users) {
            app.use(basicAuth({
                users: config.auth.users
            }))
        }

        /*
        app.post('/api/key/:key/tag/:tag', handler.handleRequest);
        app.post('/api/key/:key/tag/', handler.handleRequest);
        app.post('/api/key/:key', handler.handleRequest);
        app.post('/api/key/', handler.handleError);
        */
        app.use('/api/key', handler.handlerRequest.router())
        app.post('/api/', handler.handleError);

        app.post('/api/log/:key/tag/:tag', handler.handleRequest);
        app.post('/api/log/:key/tag/', handler.handleRequest);
        app.post('/api/log/:key', handler.handleRequest);
        app.post('/api/log/', handler.handleError);

        app.post('/api/task/:key/tag/:tag', handler.handleTask);
        app.post('/api/task/:key/tag/', handler.handleTask);
        app.post('/api/task/:key', handler.handleTask);
        app.post('/api/task/', handler.handleError);

        app.post('/api/file/', multipart(), handler.handleFile);

        app.get('/api/task/:key/status/:id', handler.handleStatus)
    };

    Joi.validate(config, configSchema, {allowUnknown: true}, (err, config) => {
        if (err) {
            console.log(err);
            process.exit(1);
        } else {
            init(config);
        }
    });

    let run = () => {
        app.listen(config.collector.port, () => {
            console.log('start with config:', config);
        });

    };

    return { run }
};

module.exports = server;