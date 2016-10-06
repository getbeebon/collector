module.exports = {
    collector: {
        port: '3000',
    },
    mysql: {
        host: '127.0.0.1',
        user: 'root',
        password: '1234',
        database: 'beebon',
        multipleStatements: true
    },
    amqp: {
        connectionString: "amqp://127.0.0.1:5672",
        queues: [
            "key1235"
        ]
    }
};