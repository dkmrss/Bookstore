const Joi = require("joi");

const bannerSchema = Joi.object({
    image: Joi.string().max(100).required(),
    title: Joi.string().max(100).required(),
    date_start: Joi.string().max(12).required(),
    date_end:Joi.string().max(12).required(),
    status: Joi.number().integer().min(0).max(1).default(0),
    trash: Joi.number().integer().min(0).max(1).default(0),
});

module.exports = bannerSchema;
