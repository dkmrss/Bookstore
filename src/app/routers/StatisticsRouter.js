const express = require("express");
const router = express.Router();
const StatisticsModel = require("../models/StatisticsModel");

/**
 * @swagger
 * /statistics/best-selling-books:
 *   get:
 *     summary: Lấy danh sách sách bán chạy
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng sách cần lấy
 *     responses:
 *       200:
 *         description: Danh sách sách bán chạy
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/best-selling-books", (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  StatisticsModel.getBestSellingBooks(limit, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

/**
 * @swagger
 * /statistics/top-keywords:
 *   get:
 *     summary: Lấy danh sách từ khóa tìm kiếm nhiều nhất
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng từ khóa cần lấy
 *     responses:
 *       200:
 *         description: Danh sách từ khóa tìm kiếm
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/top-keywords", (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  StatisticsModel.getTopKeywords(limit, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

/**
 * @swagger
 * /statistics/monthly-revenue:
 *   get:
 *     summary: Lấy doanh thu theo từng tháng
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Doanh thu theo từng tháng
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/monthly-revenue", (req, res) => {
  StatisticsModel.getMonthlyRevenue((result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

/**
 * @swagger
 * /statistics/daily-revenue:
 *   get:
 *     summary: Lấy doanh thu trong ngày
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Doanh thu trong ngày
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/daily-revenue", (req, res) => {
  StatisticsModel.getDailyRevenue((result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

/**
 * @swagger
 * /statistics/total-products-sold:
 *   get:
 *     summary: Lấy tổng số lượng sản phẩm đã bán
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Tổng số lượng sản phẩm đã bán
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/total-products-sold", (req, res) => {
    StatisticsModel.getTotalProductsSold((result) => {
      res.status(result.success ? 200 : 500).json(result);
    });
  });
  
  /**
   * @swagger
   * /statistics/order-count-by-status:
   *   get:
   *     summary: Lấy số lượng đơn hàng theo trạng thái
   *     tags: [Statistics]
   *     responses:
   *       200:
   *         description: Số lượng đơn hàng theo trạng thái
   *       500:
   *         description: Lỗi máy chủ
   */
  router.get("/order-count-by-status", (req, res) => {
    StatisticsModel.getOrderCountByStatus((result) => {
      res.status(result.success ? 200 : 500).json(result);
    });
  });

module.exports = router;