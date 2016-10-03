var amqp = require('amqplib/callback_api');
var console = require('tracer').colorConsole();

var publisher = function (config) {
    var amqpConn = null;

    var start = function () {
        amqp.connect(config.amqp.connectionString, function (err, connection) {
            if (err) {
                console.error("[AMQP]", err.message);
                return setTimeout(start, 1000);
            }
            
            connection.on("error", function (err) {
                if (err.message !== "Connection closing") {
                    console.error("[AMQP] conn error", err.message);
                }
            });

            connection.on("close", function () {
                console.error("[AMQP] reconnecting");
                return setTimeout(start, 1000);
            });
            
            console.log("[AMQP] connected");
            amqpConn = connection;
            startPublisher();
        });
    };

    var pubChannel = null;
    var offlinePubQueue = [];

    function startPublisher() {
        amqpConn.createConfirmChannel(function (err, ch) {
            if (closeOnErr(err)) return;

            ch.on("error", function (err) {
                console.error("[AMQP] channel error", err.message);
            });
            
            ch.on("close", function () {
                console.log("[AMQP] channel closed");
            });

            pubChannel = ch;
            
            while (true) {
                var m = offlinePubQueue.shift();
                if (!m) break;
                publish(m);
            }
        });
    }

    function closeOnErr(err) {
        if (!err) return false;
        console.error("[AMQP] error", err);
        amqpConn.close();
        return true;
    }

    function publish(queue, data) {
        console.log("[AMQP] start publish");
        try {
            pubChannel.assertQueue(queue);
            pubChannel.sendToQueue(queue, new Buffer(data));
        } catch (e) {
            console.error("[AMQP] publish", e.message);
            offlinePubQueue.push(data);
        }
    }

    start();

    return {
        publish: publish
    }
}

module.exports = publisher;