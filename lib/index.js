const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');

const HandlerRequest = require('./handlers/request');
const HandlerStatus = require('./handlers/status');
const HandlerFile = require('./handlers/file');
const Db = require('./db');

const config = require('config');

function createApp() {
    let app = express();
    let spec = fs.readFileSync(path.join(__dirname, 'api.yaml'), 'utf8');
    let swaggerDoc = jsyaml.safeLoad(spec);

    let conn = Db(config);

    var handlerRequest = HandlerRequest({conn});

    let options = {
        controllers: {
            HandlerRequest: handlerRequest.handleRequest,
            //HandlerStatus: HandlerStatus,
        }
    };

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

var a = createApp();
a.listen(3000);

//module.exports = createApp;