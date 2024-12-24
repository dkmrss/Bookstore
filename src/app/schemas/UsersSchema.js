const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().max(100).required(),
  name: Joi.string().max(255).required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  address: Joi.string().max(255).required(),
  avatar: Joi.string().max(200).required(),
  status: Joi.number().integer().min(0).max(127).default(1),
  role: Joi.number().integer().min(0).max(1).default(0),
});

module.exports = userSchema;
