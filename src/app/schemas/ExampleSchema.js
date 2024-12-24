const Joi = require('joi');

const exampleSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required()
});

module.exports = exampleSchema;
