const express = require("express");
const router = express.Router();
const UserModel = require("../models/UsersModel");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/avt/"); // Thư mục để lưu trữ file ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tên file sẽ được lưu trữ
  },
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý người dùng
 */

/**
 * @swagger
 * /users/get-lists:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Danh sách các người dùng
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-lists", (req, res) => {
  UserModel.getAll((result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /users/user-detail/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết của một người dùng
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của người dùng
 *       404:
 *         description: Không tìm thấy người dùng với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/user-detail/:id", (req, res) => {
  const userId = req.params.id;
  UserModel.getById(userId, (result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /users/get-list:
 *   get:
 *     summary: Lấy danh sách người dùng với giới hạn và lệch cho phân trang
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         description: Số lượng người dùng cần lấy
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Số lượng người dùng cần bỏ qua
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-list", (req, res) => {
  const take = parseInt(req.query.take);
  const skip = parseInt(req.query.skip);
  UserModel.getListWithLimitOffset(take, skip, (result) => {
    res.status(200).json(result);
  });
});
/**
 * @swagger
 * /users/create:
 *   post:
 *     summary: Tạo mới một người dùng
 *     tags: [Users]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: avatar
 *         type: file
 *         description: Hình ảnh đại diện của người dùng
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *         description: Email của người dùng
 *       - in: formData
 *         name: password
 *         type: string
 *         required: true
 *         description: Mật khẩu của người dùng
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *         description: Tên của người dùng
 *       - in: formData
 *         name: phone
 *         type: string
 *         description: Số điện thoại của người dùng
 *       - in: formData
 *         name: address
 *         type: string
 *         description: Địa chỉ của người dùng
 *     responses:
 *       201:
 *         description: Người dùng được tạo thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/create", upload.single("avatar"), (req, res) => {
  const { email, password, name, phone, address } = req.body;
  const avatar = req.file ? req.file.path : "";
  const newUser = { email, password, name, phone, address, avatar };
  UserModel.create(newUser, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /users/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin của một người dùng
 *     tags: [Users]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của người dùng cần cập nhật
 *       - in: formData
 *         name: avatar
 *         type: file
 *         description: Hình ảnh đại diện của người dùng
 *       - in: formData
 *         name: email
 *         type: string
 *         description: Email của người dùng
 *       - in: formData
 *         name: password
 *         type: string
 *         description: Mật khẩu của người dùng
 *       - in: formData
 *         name: name
 *         type: string
 *         description: Tên của người dùng
 *       - in: formData
 *         name: phone
 *         type: string
 *         description: Số điện thoại của người dùng
 *       - in: formData
 *         name: address
 *         type: string
 *         description: Địa chỉ của người dùng
 *     responses:
 *       200:
 *         description: Thông tin của người dùng được cập nhật thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/update/:id", upload.single("avatar"), (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;
  if (req.file) {
    updatedUser.avatar = req.file.path;
  }
  UserModel.update(userId, updatedUser, (result) => {
    res.status(result.success ? 200 : 400).json(result);
  });
});

/**
 * @swagger
 * /users/delete/{id}:
 *   delete:
 *     summary: Xóa một người dùng
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của người dùng cần xóa
 *     responses:
 *       200:
 *         description: Xóa người dùng thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/delete/:id", (req, res) => {
  const userId = req.params.id;
  UserModel.delete(userId, (result) => {
    res.status(200).json(result);
  });
});

module.exports = router;
