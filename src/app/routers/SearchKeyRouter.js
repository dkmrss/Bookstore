const express = require("express");
const router = express.Router();
const SearchKeyModel = require("../models/SearchKeyModel");

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: API quản lý từ khóa tìm kiếm và sản phẩm liên quan
 */

/**
 * @swagger
 * /search/keywords:
 *   get:
 *     summary: Lấy danh sách từ khóa tìm kiếm
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng bản ghi giới hạn
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Vị trí bắt đầu lấy bản ghi
 *     responses:
 *       200:
 *         description: Danh sách từ khóa
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/keywords", (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  SearchKeyModel.getKeywords(limit, offset, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

/**
 * @swagger
 * /search/keywords/{id}:
 *   delete:
 *     summary: Xóa một từ khóa tìm kiếm
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của từ khóa
 *     responses:
 *       200:
 *         description: Từ khóa đã được xóa thành công
 *       404:
 *         description: Không tìm thấy từ khóa
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/keywords/:id", (req, res) => {
  const keywordId = parseInt(req.params.id);

  if (!keywordId || isNaN(keywordId)) {
    return res.status(400).json({
      success: false,
      message: "ID không hợp lệ",
      error: "Keyword ID must be a valid integer",
    });
  }

  SearchKeyModel.deleteKeyword(keywordId, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});



module.exports = router;
