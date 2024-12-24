const express = require("express");
const router = express.Router();
const UserCommentModel = require("../models/UserComment");

/**
 * @swagger
 * tags:
 *   name: UserComment
 *   description: Quản lý bình luận của người dùng
 */

/**
 * @swagger
 * /user-comment/get-all:
 *   get:
 *     summary: Lấy danh sách tất cả bình luận của người dùng
 *     tags: [UserComment]
 *     responses:
 *       200:
 *         description: Danh sách các bình luận của người dùng
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-all", (req, res) => {
  UserCommentModel.getAll((result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /user-comment/detail/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết của một bình luận của người dùng
 *     tags: [UserComment]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của bình luận
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của bình luận
 *       404:
 *         description: Không tìm thấy bình luận với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/detail/:id", (req, res) => {
  const id = req.params.id;
  UserCommentModel.getById(id, (result) => {
    res.status(200).json(result);
  });
});
/**
 * @swagger
 * /user-comment/list:
 *   get:
 *     summary: Lấy danh sách bình luận của người dùng với giới hạn và lệch cho phân trang
 *     tags: [UserComment]
 *     parameters:
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         description: Số lượng bình luận cần lấy
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Số lượng bình luận cần bỏ qua
 *     responses:
 *       200:
 *         description: Danh sách bình luận của người dùng
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/list", (req, res) => {
  const take = parseInt(req.query.take);
  const skip = parseInt(req.query.skip);

  UserCommentModel.getListWithLimitOffset(take, skip, (result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /user-comment/list-by-field:
 *   get:
 *     summary: Lấy danh sách bình luận của người dùng theo trường và giá trị chỉ định
 *     tags: [UserComment]
 *     parameters:
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *         required: true
 *         description: Tên trường cần lấy thông tin bình luận
 *       - in: query
 *         name: value
 *         schema:
 *           type: string
 *         required: true
 *         description: Giá trị của trường cần lấy thông tin bình luận
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         required: true
 *         description: Số lượng bình luận cần lấy
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         required: true
 *         description: Số lượng bình luận cần bỏ qua
 *     responses:
 *       200:
 *         description: Danh sách bình luận của người dùng theo trường và giá trị chỉ định
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/list-by-field", (req, res) => {
  const { field, value, take, skip } = req.query;

  if (!field || !value || !take || !skip) {
    return res.status(400).json({
      data: [],
      message:
        "Thiếu thông tin trường hoặc giá trị, hoặc số lượng kết quả hoặc vị trí bắt đầu",
      success: false,
      error: "Missing field, value, take, or skip parameter",
    });
  }

  const takeInt = parseInt(take);
  const skipInt = parseInt(skip);

  if (isNaN(takeInt) || isNaN(skipInt)) {
    return res.status(400).json({
      data: [],
      message: "Số lượng kết quả hoặc vị trí bắt đầu không hợp lệ",
      success: false,
      error: "Invalid take or skip parameter",
    });
  }

  UserCommentModel.getListWithLimitOffsetByField(
    field,
    value,
    takeInt,
    skipInt,
    (result) => {
      res.status(result.success ? 200 : 400).json(result);
    }
  );
});

/**
 * @swagger
 * /user-comment/list-by-user-book:
 *   get:
 *     summary: Lấy danh sách bình luận của người dùng theo ID sách và ID người dùng
 *     tags: [UserComment]
 *     parameters:
 *       - in: query
 *         name: bookId
 *         schema:
 *           type: integer
 *         description: ID sách
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: ID người dùng
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         description: Số lượng bình luận cần lấy
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Số lượng bình luận cần bỏ qua
 *     responses:
 *       200:
 *         description: Danh sách bình luận của người dùng theo ID sách và ID người dùng
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/list-by-user-book", (req, res) => {
  const take = parseInt(req.query.take);
  const skip = parseInt(req.query.skip);
  const bookId = req.query.bookId;
  const userId = req.query.userId;

  const fields = [];
  const values = [];

  if (bookId) {
    fields.push("book_id");
    values.push(bookId);
  }

  if (userId) {
    fields.push("user_id");
    values.push(userId);
  }

  if (fields.length > 0) {
    UserCommentModel.getListWithLimitOffsetByFields(
      fields,
      values,
      take,
      skip,
      (result) => {
        res.status(result.success ? 200 : 400).json(result);
      }
    );
  } else {
    UserCommentModel.getListWithLimitOffset(take, skip, (result) => {
      res.status(200).json(result);
    });
  }
});
/**
 * @swagger
 * /user-comment/create:
 *   post:
 *     summary: Tạo một bình luận mới của người dùng
 *     tags: [UserComment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               book_id:
 *                 type: integer
 *               comment:
 *                 type: string
 *             example:
 *               user_id: 123
 *               book_id: 456
 *               comment: "Nội dung bình luận"
 *     responses:
 *       200:
 *         description: Bình luận được tạo thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/create", (req, res) => {
  const newComment = req.body;
  UserCommentModel.create(newComment, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /user-comment/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin của một bình luận của người dùng
 *     tags: [UserComment]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của bình luận cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               book_id:
 *                 type: integer
 *               comment:
 *                 type: string
 *             example:
 *               user_id: 123
 *               book_id: 456
 *               comment: "Nội dung bình luận mới"
 *     responses:
 *       200:
 *         description: Bình luận được cập nhật thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       404:
 *         description: Không tìm thấy bình luận với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/update/:id", (req, res) => {
  const commentId = req.params.id;
  const updatedComment = req.body;
  UserCommentModel.update(commentId, updatedComment, (result) => {
    res.status(result.success ? 200 : 400).json(result);
  });
});

/**
 * @swagger
 * /user-comment/delete/{id}:
 *   delete:
 *     summary: Xóa một bình luận của người dùng
 *     tags: [UserComment]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của bình luận cần xóa
 *     responses:
 *       200:
 *         description: Xóa bình luận thành công
 *       404:
 *         description: Không tìm thấy bình luận với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  UserCommentModel.delete(id, (result) => {
    res.status(200).json(result);
  });
});

module.exports = router;
