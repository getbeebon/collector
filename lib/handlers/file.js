const fs = require('fs-extra');

const handler = (conn, kue, config) => {

    var handleFile = function (req, res) {
        if (req.files.file) {
            conn.query("INSERT INTO files (`file`, `mime`) VALUES ( ? , ? );"
                , [req.files.file.originalFilename, req.files.file.type], function (err, data) {
                    console.log('data', data);
                    if (!err) {
                        fs.move(req.files.file.path, config.filestore + data.insertId, function (err) {
                            if (err) {
                                console.log('error', err);
                                res.json({fail: true, description: "File not saved in fs"});
                            } else {
                                res.json({id: data.insertId});
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

    return { handleFile }
}

module.exports = handler;