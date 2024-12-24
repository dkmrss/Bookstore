const Joi = require("joi");

const categorySchema = Joi.object({
  category_name: Joi.string().max(255).required(),
  illustration: Joi.string().max(100).required(),
  status: Joi.number().integer().min(0).max(1).default(0),
  trash: Joi.number().integer().min(0).max(1).default(0),
});

module.exports = categorySchema;
