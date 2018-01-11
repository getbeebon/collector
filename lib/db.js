const mysql = require('mysql2');
const console = require('tracer').colorConsole();


const Db = (config) => {
    let conn = mysql.createConnection(config.mysql);

    let handleDisconnect = (connection) => {
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
        query: (q, v, c) => {
            return conn.query(q, v, c);
        }
    }
};

module.exports = Db;