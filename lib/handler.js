
var Handler = function (conn) {

    var handleRequest = function (req, res) {
        var key = req.params.key;
        var tag = (req.params.tag) ? req.params.tag : '';
        var body = req.body;
        var payload = JSON.stringify(body);

        //console.log(body);
        console.log(payload);

        if (payload) {
            conn.query("INSERT INTO ?? (`tag`, `payload`) VALUES ( ? , ?);", [key, tag, payload],
                function (err) {
                if (err) {
                    console.log("err", err);
                    res.status(400).json({result: 'fail', description: 'no key'});
                } else {
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