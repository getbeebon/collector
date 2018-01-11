module.exports = {
    collector: {
        port: '3000'
    },
    mysql: {
        host: '127.0.0.1',
        user: 'root',
        password: '1234',
        database: 'beebon',
        multipleStatements: true
    },
    kue: {
        prefix: 'beebon_'
    },
    auth: {
        user: "user",
        pass: "password"
    },
    filestore: __dirname + '/var/beebon/filestore'
};