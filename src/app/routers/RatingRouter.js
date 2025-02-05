const express = require("express");
const router = express.Router();
const RatingModel = require("../models/RatingModel");

/**
 * @swagger
 * tags:
 *   name: Rating
 *   description: API quản lý đánh giá sản phẩm
 */

/**
 * @swagger
 * /rating/create:
 *   post:
 *     summary: Thêm đánh giá mới
 *     tags: [Rating]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID người dùng
 *               product_id:
 *                 type: integer
 *                 description: ID sản phẩm
 *               comment:
 *                 type: string
 *                 description: Nội dung đánh giá
 *               rating:
 *                 type: integer
 *                 description: Số sao (1-5)
 *     responses:
 *       200:
 *         description: Đánh giá được thêm thành công
 *       400:
 *         description: Người dùng chưa mua sản phẩm hoặc dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/create", (req, res) => {
    const { user_id, product_id, comment, rating } = req.body;
  
    if (
      !user_id ||
      !product_id ||
      typeof comment !== "string" ||
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
      });
    }
  
    RatingModel.create({ user_id, product_id, comment, rating }, (result) => {
      res.status(result.success ? 200 : 400).json(result);
    });
  });

/**
 * @swagger
 * /rating/list/{productId}:
 *   get:
 *     summary: Lấy danh sách đánh giá theo sản phẩm
 *     tags: [Rating]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID sản phẩm
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng đánh giá mỗi trang
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Vị trí bắt đầu lấy đánh giá
 *     responses:
 *       200:
 *         description: Danh sách đánh giá
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/list/:productId", (req, res) => {
  const productId = parseInt(req.params.productId);
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  RatingModel.getListByProduct(productId, limit, offset, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

/**
 * @swagger
 * /rating/delete/{id}:
 *   delete:
 *     summary: Xóa đánh giá
 *     tags: [Rating]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID đánh giá
 *     responses:
 *       200:
 *         description: Xóa đánh giá thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/delete/:id", (req, res) => {
  const id = parseInt(req.params.id);

  RatingModel.delete(id, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

module.exports = router;
