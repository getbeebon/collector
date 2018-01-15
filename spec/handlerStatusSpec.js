const request = require('request');
const HandlerStatus = require('../lib/handlers/status');
const express = require('express');
const bodyparser = require('body-parser');

const config = {
    port: 3000,
}

var app = express();
app.use(bodyparser.json());

var conn = Promise.resolve({ 
    query: (q, v) => { 
        console.log('query', q, v)
        return Promise.resolve([[{status: 'good', id: '10'}]]);
    }
})

describe('handler status', () => {
    it('should return 200 response code on post file api/task/', (done) => {
        var handlerStatus = HandlerStatus({conn});
        app.use('/api/task', handlerStatus.router())

        var s = app.listen(config.port, () => {
            let url = 'http://localhost:' + config.port + '/api/task/1212/id/10';
            
            request.get({url}, (error, response) => {
                console.log(error)
                expect(response.statusCode).toEqual(200);
                s.close(done);
            });
        });
    });

});