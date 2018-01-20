
var Server = require('./collector/server');
var config = require('config');

var server = Server(config);
server.run();