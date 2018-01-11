
var Server = require('./index');
var config = require('config');

var server = Server(config);
server.run();