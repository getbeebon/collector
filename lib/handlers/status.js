
const handler = (conn, kue, config) => {

	var handleStatus = (req, res) => {
        var key = req.params.key;
        var id = req.params.id;
        conn.query('SELECT * FROM ?? where `id` = ?', [key, id], (err, data) => {
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

    return { handleStatus }
}

module.exports = handler;