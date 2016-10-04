var console = require('tracer').colorConsole();

var Handler = function (conn, amqp) {

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

        console.log('IP:', ip, 'payload:', payload);
        if (payload) {
            conn.query("INSERT INTO ?? (`tag`, `payload`, `ip`) VALUES ( ? , ? , INET_ATON(?));", 
                [key, tag, payload, ip],
                function (err) {
                if (err) {
                    console.log("err", err);
                    res.status(400).json({result: 'fail', description: 'no key'});
                } else {
                    res.status(200).json({result: 'success'});
                    
                    var check = function (key) {
                        return key.substr(0, 2) == 'q_';
                    };

                    if (amqp && check(key)) {
                        amqp.publish('beebon_' + key, payload);
                    }

                    console.log('exec time:', new Date().getTime() - start, "ms");
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