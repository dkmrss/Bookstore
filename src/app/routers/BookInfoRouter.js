const express = require("express");
const router = express.Router();
const BookInfoModel = require("../models/BookInfo");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/BookInfo/"); // Thư mục để lưu trữ file ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tên file sẽ được lưu trữ
  },
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   name: BookInfo
 *   description: Quản lý thông tin sách
 */

/**
 * @swagger
 * /bookInfo/get-list:
 *   get:
 *     summary: Lấy danh sách tất cả thông tin sách
 *     tags: [BookInfo]
 *     responses:
 *       200:
 *         description: Danh sách các thông tin sách
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-list", (req, res) => {
  BookInfoModel.getList((result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /bookInfo/bookInfo-detail/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết của sách
 *     tags: [BookInfo]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của thông tin sách
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của sách
 *       404:
 *         description: Không tìm thấy thông tin sách với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/bookInfo-detail/:id", (req, res) => {
  const id = req.params.id;
  BookInfoModel.getDetail(id, (result) => {
    res.status(200).json(result);
  });
});
/**
 * @swagger
 * /bookInfo/trash/{trash}:
 *   get:
 *     summary: Lấy danh sách thông tin sách theo trạng thái trash
 *     tags: [BookInfo]
 *     parameters:
 *       - in: path
 *         name: trash
 *         schema:
 *           type: integer
 *         required: true
 *         description: Trạng thái trash (0 hoặc 1)
 *     responses:
 *       200:
 *         description: Danh sách thông tin sách theo trạng thái trash
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/trash/:trash", (req, res) => {
  const trash = req.params.trash;

  BookInfoModel.getListByTrash(trash, (result) => {
    res.status(result.success ? 200 : 400).json(result);
  });
});

/**
 * @swagger
 * /bookInfo/get-lists:
 *   get:
 *     summary: Lấy danh sách thông tin sách với giới hạn và phân trang
 *     tags: [BookInfo]
 *     parameters:
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         description: Số lượng thông tin sách cần lấy
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Số lượng thông tin sách cần bỏ qua
 *       - in: query
 *         name: types
 *         schema:
 *           type: string
 *         description: Loại sách
 *       - in: query
 *         name: trash
 *         schema:
 *           type: integer
 *         description: Trạng thái trash của thông tin sách
 *     responses:
 *       200:
 *         description: Danh sách thông tin sách
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-lists", (req, res) => {
  const take = parseInt(req.query.take);
  const skip = parseInt(req.query.skip);
  const types = req.query.types;
  const trash = req.query.trash;

  const fields = [];
  const values = [];

  if (types) {
    fields.push("types");
    values.push(types);
  }

  if (trash) {
    fields.push("trash");
    values.push(trash);
  }

  if (fields.length > 0) {
    BookInfoModel.getListWithLimitOffsetByFields(
      fields,
      values,
      take,
      skip,
      (result) => {
        res.status(result.success ? 200 : 400).json(result);
      }
    );
  } else {
    BookInfoModel.getListWithLimitOffset(take, skip, (result) => {
      res.status(200).json(result);
    });
  }
});
/**
 * @swagger
 * /bookInfo/get-list-by-field:
 *   get:
 *     summary: Lấy danh sách thông tin sách theo trường và giá trị chỉ định
 *     tags: [BookInfo]
 *     parameters:
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *         required: true
 *         description: Tên trường cần lấy thông tin sách
 *       - in: query
 *         name: value
 *         schema:
 *           type: string
 *         required: true
 *         description: Giá trị của trường cần lấy thông tin sách
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         required: true
 *         description: Số lượng thông tin sách cần lấy
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         required: true
 *         description: Số lượng thông tin sách cần bỏ qua
 *     responses:
 *       200:
 *         description: Danh sách thông tin sách theo trường và giá trị chỉ định
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-list-by-field", (req, res) => {
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

  BookInfoModel.getListByFieldWithLimitOffset(
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
 * /bookInfo/create:
 *   post:
 *     summary: Tạo thông tin mới về sách
 *     tags: [BookInfo]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: book_images
 *         type: file
 *         description: Hình ảnh sách
 *       - in: formData
 *         name: types
 *         type: string
 *         description: Loại sách
 *       - in: formData
 *         name: pages
 *         type: integer
 *         description: Số trang sách
 *       - in: formData
 *         name: book_id
 *         type: integer
 *         description: ID của sách
 *     responses:
 *       201:
 *         description: Thông tin sách được tạo thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/create", upload.single("book_images"), (req, res) => {
  const { types, pages, book_id } = req.body;
  const book_images = req.file ? req.file.path : "";

  const newBookInfo = { types, pages, book_id, book_images };

  BookInfoModel.create(newBookInfo, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /bookInfo/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin sách
 *     tags: [BookInfo]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của thông tin sách cần cập nhật
 *       - in: formData
 *         name: book_images
 *         type: file
 *         description: Hình ảnh sách
 *       - in: formData
 *         name: types
 *         type: string
 *         description: Loại sách
 *       - in: formData
 *         name: pages
 *         type: integer
 *         description: Số trang sách
 *       - in: formData
 *         name: book_id
 *         type: integer
 *         description: ID của sách
 *     responses:
 *       200:
 *         description: Thông tin sách được cập nhật thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/update/:id", upload.single("book_images"), (req, res) => {
  const id = req.params.id;
  const updatedBookInfo = req.body;
  if (req.file) {
    updatedBookInfo.book_images = req.file.path;
  }

  BookInfoModel.update(id, updatedBookInfo, (result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /bookInfo/types/{id}:
 *   put:
 *     summary: Cập nhật loại sách
 *     tags: [BookInfo]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của thông tin sách
 *     responses:
 *       200:
 *         description: Cập nhật loại sách thành công
 *       404:
 *         description: Không tìm thấy thông tin sách với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/types/:id", (req, res) => {
  const id = req.params.id;

  BookInfoModel.getDetail(id, (result) => {
    if (!result.success) {
      return res.status(404).json(result);
    }

    const newType = result.data.status === "cover" ? "read" : "cover";

    BookInfoModel.updateType(id, newType, (result) => {
      res.status(result.success ? 200 : 400).json(result);
    });
  });
});

/**
 * @swagger
 * /bookInfo/delete/{id}:
 *   delete:
 *     summary: Xóa thông tin sách
 *     tags: [BookInfo]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của thông tin sách cần xóa
 *     responses:
 *       200:
 *         description: Xóa thông tin sách thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  BookInfoModel.delete(id, (result) => {
    res.status(200).json(result);
  });
});
module.exports = router;
