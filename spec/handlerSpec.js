const hippie = require('hippie-swagger');
const SwaggerParser = require('swagger-parser');
const fs = require('fs');
const path = require('path');
const jsyaml = require('js-yaml');

let createApp = require('../lib/index');

let dereferencedSwagger;

describe('App', () => {
    beforeEach((done) => {
        let spec = fs.readFileSync(path.join(__dirname, './../lib/api.yaml'), 'utf8');
        let swaggerDoc = jsyaml.safeLoad(spec);

        let parser = new SwaggerParser();
        parser.dereference(swaggerDoc, (err, derefSwagger) => {
            dereferencedSwagger = derefSwagger;
            done();
        })
    });

    it('log pass good', (done) => {
        var conn = Promise.resolve({ 
            query: (q, v) => { 
                console.log('query', q, v)
                return Promise.resolve([{insertId: 'good'}]);
            }
        })
        let config = {filestore: ''};
        let kue;
        let app = createApp({conn, kue, config});

        hippie(app, dereferencedSwagger)
            .json()
            .post('/api/log/{key}')
            .pathParams({
              key: '1234'
            })
            .send({
                number: 456987
            })
            .end(function (err, res, body) {
                console.log(res.statusCode);
                expect(res.statusCode).toEqual(200);
                expect(res.body).toEqual('{"result":"success","id":"good"}');
                if (err) done(err);
                done()
            })
    });

    it('task pass good', (done) => {
        var conn = Promise.resolve({ 
            query: (q, v) => { 
                console.log('query', q, v)
                return Promise.resolve([{insertId: 'good'}]);
            }
        })
        let config = {
            filestore: '', 
            kue: {
                prefix: 'beebon_'
            }
        };
        let kue = {
            publish: () => {}
        }
        let app = createApp({conn, kue, config});

        hippie(app, dereferencedSwagger)
            .json()
            .post('/api/task/{key}')
            .pathParams({
              key: '1234'
            })
            .send({
                number: 456987
            })
            .end(function (err, res, body) {
                console.log(res.statusCode);
                expect(res.statusCode).toEqual(200);
                expect(res.body).toEqual('{"result":"success","id":"good"}');
                if (err) done(err);
                done()
            })
    });


/*
    it('file pass good', (done) => {
        var conn = Promise.resolve({ 
            query: (q, v) => { 
                console.log('query', q, v)
                return Promise.resolve([{insertId: 'good'}]);
            }
        })
        let config = {
            filestore: '', 
        };
        let kue;
        let app = createApp({conn, kue, config});

        var file = 'Content-Disposition: form-data; name="filename"';
        hippie(app, dereferencedSwagger)
            .header('Content-Type','multipart/form-data')
            .post('/api/file')            
            .send(file)
            .end(function (err, res, body) {
                console.log(res.statusCode);
                expect(res.statusCode).toEqual(200);
                expect(res.body).toEqual('{"result":"success","id":"good"}');
                if (err) done(err);
                done()
            })
    });
*/
});