const express = require('express');

const handler = ({conn}) => {

	var handleStatus = (req, res) => {
        var key = req.params.key;
        var id = req.params.id;

        conn.then((c) => {
            return c.query('SELECT * FROM ?? where `id` = ?', [key, id]);
        }).then((data) => {
            console.log('data', data[0]);    
            if (data[0]) {
                res.json({result: 'success', status: data[0].status})
            } else {
                res.status(400).json({result: 'fail', description: 'no data'});
            }        
        }).catch((e) => {
            console.log('error', e);
            res.status(400).json({result: 'fail', description: 'error on request'});
        })
    };

    const router = () => {
        let r = express.Router();
        r.get('/:key/id/:id', handleStatus);
        return r;
    }

    return { handleStatus, router }
}

module.exports = handler;