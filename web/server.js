const express = require('express');
const bodyParser = require('body-parser');
const console = require('tracer').colorConsole();

let server = (config) => {
  let app = express();
  let init = () => {
    app.set('views', __dirname + "/views");
    app.set('view engine', 'pug');
    app.use('/static', express["static"](__dirname + "./../node_modules"));
    app.use('/public', express["static"](__dirname + "/public"));
    app.use(bodyParser.json());

    app.use('/keys', require('./router/model'));
    
    app.get('/partials/:view', (req, res) => {
      return res.render('partials/' + req.params.view);
    });
    
    return app.get('/', (req, res) => {
      return res.render('index');
    });
  };

  run = () => {
    init();
    return app.listen(config.web.port, () => {
      console.log('app started with config', config);
    });
  };

  return {
    run: run
  };
};

module.exports = server;