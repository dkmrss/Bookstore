const Joi = require("joi");

const ProductSchema = Joi.object({
  product_name: Joi.string().max(255).required(), // Tên sản phẩm, bắt buộc
  publisher: Joi.string().max(255).required(), // Nhà xuất bản, bắt buộc
  author: Joi.string().max(255).required(), // Tác giả, bắt buộc
  category_id: Joi.number().integer().required(), // ID danh mục, bắt buộc
  sale: Joi.number().default(true), // Có giảm giá không, mặc định là true
  image: Joi.string().max(255).required(), // Đường dẫn ảnh, bắt buộc
  quantity: Joi.number().integer().min(0).default(0), // Số lượng, mặc định là 0
  price: Joi.number().positive().required(), // Giá gốc, bắt buộc
  saleprice: Joi.number().positive().required(), // Giá khuyến mãi, bắt buộc
  product_detail: Joi.string().required(), // Chi tiết sản phẩm, bắt buộc
  status: Joi.number().integer().valid(0, 1).default(0), // TINYINT(1), default 0
  trash: Joi.number().integer().valid(0, 1).default(0), // TINYINT(1), default 0
});

module.exports = ProductSchema;