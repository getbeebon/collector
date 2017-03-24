var console = require('tracer').colorConsole();
var fs = require('fs-extra');

var Handler = function (conn, kue, config) {

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
                        kue.publish(config.kue.prefix + key, body, data.id);

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

    var handleStatus = function (req, res) {
        var key = req.params.key;
        var id = req.params.id;
        conn.query('SELECT * FROM ?? where `id` = ?', [key, id], function (err, data) {
            if (err) {
                console.log("err", err);
                res.status(400).json({result: 'fail', description: 'error on request'});
            } else {
                if (data[0]) {
                    res.json({result: 'success', status: data[0].status})
                } else {
                    res.status(400).json({result: 'fail', description: 'no data'});
                }
            }
        });
    };

    var handleFile = function (req, res) {
        if (req.files.file) {
            conn.query("INSERT INTO files (`file`, `mime`) VALUES ( ? , ? );"
                , [req.files.file.originalFilename, req.files.file.type], function (err, data) {
                    if (!err) {
                        fs.move(req.files.file.path, config.filestore + data.id, function (err) {
                            if (err) {
                                res.json({fail: true, description: "File not saved in fs"});
                            } else {
                                res.json({id: data.id});
                            }
                        });
                    } else {
                        res.json({fail: true, description: "File not saved in database"});
                    }
                }
            )
        } else {
            res.json({fail: true, description: "file not send"})
        }
    };

    return {
        handle: handleRequest,
        handleError: handleErrorRequest,
        handleTask: handleTask,
        handleStatus: handleStatus,
        handleFile: handleFile
    };

};

module.exports = Handler;