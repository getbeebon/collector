
const handler = (conn, kue, config) => {

    var handleTask = (req, res) => {
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

    return { handleTask }
}

module.exports = handler;