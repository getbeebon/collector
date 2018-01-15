const request = require('request');
const HandlerFile = require('../lib/handlers/file');
const express = require('express');
const bodyparser = require('body-parser');

const config = {
    port: 3000,
    filestore: '/tmp'
}

var app = express();
app.use(bodyparser.json());

var conn = Promise.resolve({ 
    query: (q, v) => { 
        console.log('query', q, v)
        return Promise.resolve({insertId: 'good'});
    }
})

describe('handler file', () => {
    it('should return 200 response code on post file api/file/', (done) => {
        var path
        var fse = {
            move: (a, b, cb) => {
                path = a;
                cb();
            }
        }
        var fs = require('fs');

        var formData = {
            file: fs.createReadStream(__dirname + '/1.gif')
        };

        var handlerFile = HandlerFile({conn, fs: fse, config});
        app.use('/api/file', handlerFile.router())

        var s = app.listen(config.port, () => {
            let url = 'http://localhost:' + config.port + '/api/file/';
            
            request.post({url, formData}, (error, response) => {
                expect(response.statusCode).toEqual(200);
                console.log('path:', path);
                fs.unlink(path, console.log);
                s.close(done);
            });
        });
    });

});