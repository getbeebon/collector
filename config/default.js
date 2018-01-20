module.exports = {
    collector: {
        port: '3000',
        baseUrl: 'http://localhost:3000'
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
    web: {
        port: 3101
    },
    /*auth: {
        users: {
            'user': 'password'
        }
    },*/
    filestore: 'uploads'
};