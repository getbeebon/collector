Joi = require('joi');

var configSchema = Joi.object().keys({
    port: Joi.number().required(),
    mysql: Joi.object().keys({
    	host: Joi.string().required(),
    	port: Joi.number().integer().min(1).max(65535).default(3306),
      	user: Joi.string().required(),
      	password: Joi.string().allow('').required(),
      	database: Joi.string().required(),
      	multipleStatements: Joi.boolean().default(true)
    })
});

module.exports = configSchema;