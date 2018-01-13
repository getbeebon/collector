const console = require('tracer').colorConsole();

const HandlerTask = require('./handlers/task');
const HandlerRequest = require('./handlers/request');
const HandlerStatus = require('./handlers/status');
const HandlerFile = require('./handlers/file');

const Handler = (conn, kue, config) => {

    var handlerTask = HandlerTask(conn, kue, config);
    var handlerRequest = HandlerRequest(conn);
    var handlerStatus = HandlerStatus(conn, kue, config);
    var handlerFile = HandlerFile(conn, kue, config);

    var handleErrorRequest = (req, res) => {
        console.log('error', req);
        res.status(400).json({result: 'fail', description: 'no key'});
    };

    return {
        handlerRequest: handlerRequest,
        handleRequest: handlerRequest.handleRequest,
        handleTask: handlerTask.handleTask,
        handleStatus: handlerStatus.handleStatus,
        handleFile: handlerFile.handleFile,
        handleError: handleErrorRequest,
    };

};

module.exports = Handler;