const express = require("express");
const CartModel = require("../models/CartModel");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API quản lý giỏ hàng
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Lấy danh sách sản phẩm trong giỏ hàng
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm trong giỏ hàng
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", (req, res) => {
  const userId = req.query.userId;

  CartModel.getCart(userId, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

/**
 * @swagger
 * /cart/addCart:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ hàng
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sản phẩm được thêm vào giỏ hàng thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/addCart", (req, res) => {
  const { userId, productId, quantity } = req.body;

  CartModel.addToCart(userId, productId, quantity, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

/**
 * @swagger
 * /cart:
 *   put:
 *     summary: Cập nhật số lượng sản phẩm trong giỏ hàng
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID của người dùng
 *               productId:
 *                 type: integer
 *                 description: ID của sản phẩm
 *               quantity:
 *                 type: integer
 *                 description: Số lượng sản phẩm mới
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/", (req, res) => {
    const { userId, productId, quantity } = req.body;
  
    if (!userId || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Thông tin yêu cầu không đầy đủ",
      });
    }
  
    CartModel.updateCartItem(userId, productId, quantity, (result) => {
      res.status(result.success ? 200 : 500).json(result);
    });
  });

/**
 * @swagger
 * /cart/delete:
 *   delete:
 *     summary: Xóa sản phẩm khỏi giỏ hàng
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: ID của người dùng
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Sản phẩm được xóa thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/delete", (req, res) => {
    const { userId, productId } = req.query;
  
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "userId và productId là bắt buộc",
      });
    }
  
    CartModel.removeCartItem(userId, productId, (result) => {
      res.status(result.success ? 200 : 500).json(result);
    });
  });
/**
 * @swagger
 * /cart/view:
 *   get:
 *     summary: Xem giỏ hàng của người dùng
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Danh sách giỏ hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     cartItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           cart_id:
 *                             type: integer
 *                           product_id:
 *                             type: integer
 *                           product_name:
 *                             type: string
 *                           image:
 *                             type: string
 *                           price:
 *                             type: number
 *                           saleprice:
 *                             type: number
 *                           total_price:
 *                             type: number
 *                     totalCartValue:
 *                       type: number
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/view", (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp userId",
    });
  }

  CartModel.viewCart(userId, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Xóa toàn bộ giỏ hàng
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Giỏ hàng đã được xóa
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/clear", (req, res) => {
  const userId = req.query.userId;

  CartModel.clearCart(userId, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

module.exports = router;
