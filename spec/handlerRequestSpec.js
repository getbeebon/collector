const request = require('request');
const HandlerRequest = require('../lib/handlers/request');
const express = require('express');
const bodyparser = require('body-parser');

const config = {
    port: 3000
}

var app = express();
app.use(bodyparser.json());

//let handler = Handler(db, kue, config);
var conn = Promise.resolve({ 
    query: (q, v) => { 
        console.log('query', q, v)
        return Promise.resolve('good');
    }
})

describe('handlerRequest', () => {
    it('should return 200 response code on api/key/:key', (done) => {
        var handlerRequest = HandlerRequest({conn});
        app.use('/api/key', handlerRequest.router())

        var s = app.listen(config.port, () => {
            let endpoint = 'http://localhost:' + config.port + '/api/key/1234';
            
            request.post({
                url: endpoint, 
                body: {
                    text: '1212'
                    }, 
                json: true
            }, (error, response) => {
                expect(response.statusCode).toEqual(200);
                s.close(done);
            });
        });
    });

    it('should return 200 response code on api/key/:key/tag/:tag', (done) => {
        var handlerRequest = HandlerRequest({conn});
        app.use('/api/key', handlerRequest.router())

        var s = app.listen(config.port, () => {
            let endpoint = 'http://localhost:' + config.port + '/api/key/1234/tag/1111';
            
            request.post({
                url: endpoint, 
                body: {
                    text: '1212'
                    }, 
                json: true
            }, (error, response) => {
                expect(response.statusCode).toEqual(200);
                s.close(done);
            });
        });
    });

});