const express = require('express');
const Joi = require('joi');
const console = require('tracer').colorConsole();

const configSchema = require('./lib/configSchema');
const Kue = require('./lib/kue');
const Db = require('./lib/db');
const createApp = require('./lib/index');

const server = (config) => {

    let app, conn, kue;

    let init = (config) => {
        conn = Db(config);
        kue = new Kue({conn, config});

        app = createApp({conn, kue, config});
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