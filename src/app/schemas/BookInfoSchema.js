const Joi = require("joi");

const BookInfoSchema = Joi.object({
  book_id: Joi.number().integer().required(), // Integer, required
  book_images: Joi.string().max(200).required(), // VARCHAR(200), required
  types: Joi.string().max(10).required(), // VARCHAR(10), required
  pages: Joi.number().integer().required(), // Integer, required
  trash: Joi.number().integer().valid(0, 1).default(0),
});

module.exports = BookInfoSchema;
