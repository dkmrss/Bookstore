const express = require("express");
const router = express.Router();
const AuthModel = require("../models/AuthModel");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API for user authentication
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập người dùng
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email của người dùng
 *               password:
 *                 type: string
 *                 description: Mật khẩu của người dùng
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       401:
 *         description: Thông tin đăng nhập không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email và mật khẩu là bắt buộc",
      error: "Missing fields",
    });
  }

  AuthModel.login(email, password, (result) => {
    res.status(result.success ? 200 : 401).json(result);
  });
});

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Đổi mật khẩu người dùng
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID người dùng
 *               oldPassword:
 *                 type: string
 *                 description: Mật khẩu cũ
 *               newPassword:
 *                 type: string
 *                 description: Mật khẩu mới
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Lỗi dữ liệu đầu vào
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/change-password", (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin bắt buộc",
      error: "Missing fields",
    });
  }

  AuthModel.changePassword(userId, oldPassword, newPassword, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Đăng xuất người dùng
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token của người dùng
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/logout", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token là bắt buộc",
      error: "Missing token",
    });
  }

  AuthModel.logout(token, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Yêu cầu đặt lại mật khẩu
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email của người dùng
 *     responses:
 *       200:
 *         description: Token đặt lại mật khẩu đã được gửi
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email là bắt buộc",
      error: "Missing email",
    });
  }

  AuthModel.forgotPassword(email, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resetToken:
 *                 type: string
 *                 description: Token đặt lại mật khẩu
 *               newPassword:
 *                 type: string
 *                 description: Mật khẩu mới
 *     responses:
 *       200:
 *         description: Mật khẩu đã được đặt lại thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/reset-password", (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Token và mật khẩu mới là bắt buộc",
      error: "Missing fields",
    });
  }

  AuthModel.resetPassword(resetToken, newPassword, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

/**
 * @swagger
 * /auth/activate:
 *   post:
 *     summary: Kích hoạt tài khoản
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Mã kích hoạt từ email
 *     responses:
 *       200:
 *         description: Tài khoản đã được kích hoạt thành công
 *       400:
 *         description: Yêu cầu không hợp lệ hoặc mã kích hoạt không đúng
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/activate", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã kích hoạt.",
    });
  }

  AuthModel.activateAccount(token, (result) => {
    res.status(result.success ? 200 : 400).json(result);
  });
});

/**
 * @swagger
 * /auth/reactive:
 *   post:
 *     summary: Gửi lại mã kích hoạt tài khoản
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email tài khoản
 *     responses:
 *       200:
 *         description: Mã kích hoạt đã được gửi lại
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/reactive", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email là trường bắt buộc",
    });
  }

  AuthModel.reActive(email, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

module.exports = router;
