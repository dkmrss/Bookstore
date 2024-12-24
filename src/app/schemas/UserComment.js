const Joi = require("joi");

const commentSchema = Joi.object({
  book_id: Joi.number().integer().required(),
  user_id: Joi.number().integer().required(),
  content: Joi.string().required(), // TEXT, required
});

module.exports = commentSchema;
