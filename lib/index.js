const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const basicAuth = require('express-basic-auth');
const fse = require('fs-extra');
const multipart = require('connect-multiparty');

const HandlerRequest = require('./handlers/request');
const HandlerStatus = require('./handlers/status');
const HandlerFile = require('./handlers/file');

const config = require('config');

function createApp({conn, kue, config}) {
    let app = express();
    let spec = fs.readFileSync(path.join(__dirname, 'api.yaml'), 'utf8');
    let swaggerDoc = jsyaml.safeLoad(spec);

    var handlerRequest = HandlerRequest({conn, kue, config});
    var handlerStatus = HandlerStatus({conn});
    var handlerFile = HandlerFile({conn, fs: fse, config});

    let options = {
        controllers: {
            HandlerLogRequest: handlerRequest.handleRequest,
            HandlerTaskRequest: (req, res, next) => {
                req.sendToKue = true;
                handlerRequest.handleRequest(req, res, next)
            },
            HandlerStatusRequest: handlerStatus.handleStatus,
            HandlerFile: handlerFile.handleFile
        }
    };

    //auth
    /*
    if (config.auth && config.auth.users) {
        app.use(basicAuth({
            users: config.auth.users
        }))
    }

    */

    app.use(bodyParser.json());
    app.use(cors());

    swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {
        app.use(middleware.swaggerMetadata());
        app.use(middleware.swaggerValidator({validateResponse: false}));
        app.use(middleware.swaggerUi());
        
        app.use(middleware.swaggerRouter(options));
        app.use((err, req, res, next) => {
            res.status(500).json(err);
        });
    });

    return app;
}

module.exports = createApp;