const express = require('express');
const helper = require('./../helper');

const handler = (conn) => {

	var handleRequest = (req, res) => {
        var start = new Date().getTime();

        var key = req.params.key;
        var tag = (req.params.tag) ? req.params.tag : '';
        var payload = JSON.stringify(req.body || {});
        var ip = helper.getIP(req);

        console.log([
            'IP: ' + ip,
            'key: ' + key,
            'tag: ' + tag,
            'payload: ' + payload
        ].join(", "));

        if (!payload) {
        	res.status(400).json({result: 'fail', description: 'not valid json'});
        }
        
        let pass = (err) => {
            if (err) {
                console.log("err", err);
                res.status(400).json({result: 'fail', description: 'no key'});
            } else {
                console.log('exec time:', new Date().getTime() - start, "ms");
                res.status(200).json({result: 'success'});
            }
        };

        conn.query("INSERT INTO ?? (`tag`, `payload`, `ip`) VALUES ( ? , ? , INET_ATON(?));",
            [key, tag, payload, ip], pass);
    };

    const router = () => {
    	let r = express.Router();

    	r.post('/:key/tag/:tag', handleRequest);
        r.post('/:key/tag/', handleRequest);
        r.post('/:key', handleRequest);
        //r.post('/', handler.handleError);

        return r;
    }

    return { handleRequest, router }
}

module.exports = handler;