var mysql = require('mysql2');
var console = require('tracer').colorConsole();


var Db = function (config) {
    var conn = mysql.createConnection(config.mysql);

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
    return {
        query: conn.query
    }
};
module.exports = Db;