const Joi = require("joi");

const newSchema = Joi.object({
  title: Joi.string().max(255).required(), // VARCHAR(255), required
  short_description: Joi.string().required(), // TEXT, required
  content: Joi.string().required(), // TEXT, required
  avatar: Joi.string().max(255).allow(null).optional(), // VARCHAR(255), can be null or optional
  status: Joi.number().integer().valid(0, 1).default(0), // TINYINT(1), default 0
  trash: Joi.number().integer().valid(0, 1).default(0), // TINYINT(1), default 0
});

module.exports = newSchema;
