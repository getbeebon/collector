const express = require('express');
const bodyparser = require('body-parser');
const fs = require('fs-extra');
const Joi = require('joi');
const console = require('tracer').colorConsole();
const basicAuth = require('express-basic-auth')

const configSchema = require('./lib/configSchema');
const Kue = require('./lib/kue');
const Db = require('./lib/db');

const HandlerRequest = require('./lib/handlers/request');
const HandlerStatus = require('./lib/handlers/status');
const HandlerFile = require('./lib/handlers/file');

const server = (config) => {

    let app, conn, kue;

    let init = (config) => {
        app = express();
        app.use(bodyparser.json());

        //auth
        if (config.auth && config.auth.users) {
            app.use(basicAuth({
                users: config.auth.users
            }))
        }

        conn = Db(config);
        kue = new Kue({conn, config});

        var handlerRequest = HandlerRequest({conn, kue, config});
        var handlerStatus = HandlerStatus({conn});
        var handlerFile = HandlerFile({conn, fs, config});

        app.use('/api/key', handlerRequest.router());
        app.use('/api/log', handlerRequest.router());

        app.use('/api/task', handlerRequest.router((req, res, next) => {
            req.sendToKue = true;
            next();
        }));
        app.use('/api/task', handlerStatus.router());

        app.use('/api/file/', handlerFile.router());

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