var console = require('tracer').colorConsole();

var Handler = function (conn, amqp, kue, config) {

    var getIP = function (req) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (ip.substr(0, 7) == "::ffff:") {
            ip = ip.substr(7)
        }
        return ip;
    };

    var handleRequest = function (req, res) {
        var start = new Date().getTime();

        var key = req.params.key;
        var tag = (req.params.tag) ? req.params.tag : '';
        var body = req.body;
        var payload = JSON.stringify(body);
        var ip = getIP(req);

        console.log([
            'IP: ' + ip,
            'key: ' + key,
            'payload: ' + payload
        ].join(", "));

        if (payload) {
            conn.query("INSERT INTO ?? (`tag`, `payload`, `ip`) VALUES ( ? , ? , INET_ATON(?));",
                [key, tag, payload, ip],
                function (err) {
                    if (err) {
                        console.log("err", err);
                        res.status(400).json({result: 'fail', description: 'no key'});
                    } else {
                        //console.log(config.amqp);

                        if (amqp && config.amqp.queues.indexOf(key) != -1) {
                            console.log('publish to amqp:', config.amqp.prefix + key, payload);
                            amqp.publish(config.amqp.prefix + key, payload);
                        }

                        console.log('exec time:', new Date().getTime() - start, "ms");

                        res.status(200).json({result: 'success'});
                    }
                });
        } else {
            res.status(400).json({result: 'fail', description: 'not valid json'});
        }
    };
    var handleTask = function (req, res) {
        var start = new Date().getTime();

        var key = req.params.key;
        var tag = (req.params.tag) ? req.params.tag : '';
        var body = req.body;
        var payload = JSON.stringify(body);
        var ip = getIP(req);

        console.log([
            'IP: ' + ip,
            'key: ' + key,
            'payload: ' + payload
        ].join(", "));

        if (payload) {
            conn.query("INSERT INTO ?? (`tag`, `payload`, `ip`, `status`) VALUES ( ? , ? , INET_ATON(?) , ? );",
                [key, tag, payload, ip, 'inProcess'],
                function (err, data) {
                    if (err) {
                        console.log("err", err);
                        res.status(400).json({result: 'fail', description: 'no key'});
                    } else {
                        console.log('publish to kue:', config.kue.prefix + key, payload);
                        kue.publish(config.kue.prefix + key, payload, data.id);

                        console.log('exec time:', new Date().getTime() - start, "ms");

                        res.status(200).json({result: 'success'});
                    }
                });
        } else {
            res.status(400).json({result: 'fail', description: 'not valid json'});
        }

    };

    var handleErrorRequest = function (req, res) {
        res.status(400).json({result: 'fail', description: 'no key'});
    };

    return {
        handle: handleRequest,
        handleError: handleErrorRequest
    };
};

module.exports = Handler;