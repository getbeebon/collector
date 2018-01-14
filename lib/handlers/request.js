const express = require('express');
const console = require('tracer').colorConsole();

const handler = ({conn, kue, config}) => {

    var handleRequest = (req, res) => {
        var start = new Date().getTime();

        var key = req.params.key;
        var tag = (req.params.tag) ? req.params.tag : '';
        var payload = JSON.stringify(req.body || {});

        console.log([            
            'key: ' + key,
            'tag: ' + tag,
            'payload: ' + payload
        ].join(", "));

        if (!payload) {
            res.status(400).json({result: 'fail', description: 'not valid json'});
            return;
        }

        conn.then((c) => {
            return c.query("INSERT INTO ?? (`tag`, `payload`) VALUES ( ? , ? );",
                [key, tag, payload]);
        })
        .then((r) => {
            let id = r[0].insertId;
            console.log('inserted id', id);
            if (req.sendToKue) {
                kue.publish(config.kue.prefix + key, req.body, id);
            }
            return Promise.resolve({id})
        })
        .then((r) => {
            res.status(200).json({result: 'success', id: r.id});
            console.log('exec time:', new Date().getTime() - start, "ms");
        })
        .catch((e) => {
            console.log('error:', e)
            res.status(500).json({error: 'error'});
        });
    };

    const router = (middleware) => {
        let r = express.Router();
        
        if (middleware) {
            r.use(middleware);
        }

        r.post('/:key/tag/:tag', handleRequest);
        r.post('/:key', handleRequest);

        return r;
    }

    return { handleRequest, router }
}

module.exports = handler;