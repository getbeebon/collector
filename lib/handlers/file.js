
const console = require('tracer').colorConsole();
const express = require('express');
const multipart = require('connect-multiparty');

const handler = ({conn, fs, config}) => {

    const handleFile = (req, res) => {
        //console.log(req.files);
        var file = req.swagger.params.file;
        console.log('file:', file.value);
        if (!req.files.file) { 
            Promise.reject({fail: true, description: "file not send"});
        }

        console.log('req.files:', req.files);
        conn.then((c) => {
            return c.query("INSERT INTO files (`file`, `mime`) VALUES ( ? , ? );"
            , [req.files.file.originalFilename, req.files.file.type]);
        })
        .then((data) => {
            console.log('data:', data);
            return new Promise((resolve, reject) =>{
                fs.move(req.files.file.path, config.filestore + data.insertId, (err) => {
                    if (err) {
                        reject({fail: true, description: "File not saved in fs"});
                        return;
                    }
                    resolve({id: data.insertId});
                });
            });
        })
        .then((result) => {
            console.log('result:', result);
            res.status(200).json(result);
        })
        .catch((e) => {
            console.log('error', e);
            res.status(500).json({error: 'error', fail: true});
        })
    };

    const router = (req, res) => {
        let r = express.Router();

        r.post('/', multipart(), handleFile);
        return r;
    }

    return { router, handleFile }
}

module.exports = handler;