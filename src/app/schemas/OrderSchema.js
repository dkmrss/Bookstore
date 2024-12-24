const Joi = require("joi");

const orderSchema = Joi.object({
  customer_id: Joi.number().integer().required(),
  name: Joi.string().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  address: Joi.string().allow(null, "").required(),
  total: Joi.number().integer().required(),
  note: Joi.string().allow(null, ""),
  delivered: Joi.number().integer().default(0),
  method: Joi.number().integer().required(),
  payment: Joi.number().integer().required(),
});

module.exports = orderSchema;
