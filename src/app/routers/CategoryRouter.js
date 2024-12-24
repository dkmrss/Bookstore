const express = require("express");
const router = express.Router();
const CategoryModel = require("../models/CategoryModel");
const multer = require("multer");

// Thiết lập lưu trữ cho multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/Category/"); // Thư mục để lưu trữ file ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tên file sẽ được lưu trữ
  },
});

const upload = multer({ storage: storage });


/**
 * @swagger
 * /category/get-list:
 *   get:
 *     summary: Lấy danh sách tất cả danh mục sách
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Danh sách các danh mục sách
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-list", (req, res) => {
  CategoryModel.getList((result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /category/category-detail/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết của một danh mục sách
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của danh mục sách
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của danh mục sách
 *       404:
 *         description: Không tìm thấy danh mục sách với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/category-detail/:id", (req, res) => {
  const id = req.params.id;
  CategoryModel.getDetail(id, (result) => {
    res.status(200).json(result);
  });
});
/**
 * @swagger
 * /category/get-lists:
 *   get:
 *     summary: Lấy danh sách danh mục sách với giới hạn và lệch cho phân trang
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         description: Số lượng danh mục sách cần lấy
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Số lượng danh mục sách cần bỏ qua
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: Trạng thái của danh mục sách
 *       - in: query
 *         name: trash
 *         schema:
 *           type: integer
 *         description: Trạng thái trash của danh mục sách
 *     responses:
 *       200:
 *         description: Danh sách danh mục sách
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-lists", (req, res) => {
  const take = parseInt(req.query.take);
  const skip = parseInt(req.query.skip);
  const status = req.query.status;
  const trash = req.query.trash;

  const fields = [];
  const values = [];

  if (status) {
    fields.push("status");
    values.push(status);
  }

  if (trash) {
    fields.push("trash");
    values.push(trash);
  }

  if (fields.length > 0) {
    CategoryModel.getListWithLimitOffsetByFields(
      fields,
      values,
      take,
      skip,
      (result) => {
        res.status(result.success ? 200 : 400).json(result);
      }
    );
  } else {
    CategoryModel.getListWithLimitOffset(take, skip, (result) => {
      res.status(200).json(result);
    });
  }
});
/**
 * @swagger
 * /category/status/{status}:
 *   get:
 *     summary: Lấy danh sách danh mục sách theo trạng thái
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: integer
 *         required: true
 *         description: Trạng thái của danh mục sách
 *     responses:
 *       200:
 *         description: Danh sách danh mục sách theo trạng thái
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/status/:status", (req, res) => {
  const status = req.params.status;

  CategoryModel.getListByStatus(status, (result) => {
    res.status(result.success ? 200 : 400).json(result);
  });
});

/**
 * @swagger
 * /category/trash/{trash}:
 *   get:
 *     summary: Lấy danh sách danh mục sách theo trạng thái trash
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: trash
 *         schema:
 *           type: integer
 *         required: true
 *         description: Trạng thái trash của danh mục sách
 *     responses:
 *       200:
 *         description: Danh sách danh mục sách theo trạng thái trash
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/trash/:trash", (req, res) => {
  const trash = req.params.trash;

  CategoryModel.getListByTrash(trash, (result) => {
    res.status(result.success ? 200 : 400).json(result);
  });
});

/**
 * @swagger
 * /category/get-list-by-field:
 *   get:
 *     summary: Lấy danh sách danh mục sách theo trường và giá trị chỉ định
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *         required: true
 *         description: Tên trường cần lấy danh mục sách
 *       - in: query
 *         name: value
 *         schema:
 *           type: string
 *         required: true
 *         description: Giá trị của trường cần lấy danh mục sách
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         required: true
 *         description: Số lượng danh mục sách cần lấy
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         required: true
 *         description: Số lượng danh mục sách cần bỏ qua
 *     responses:
 *       200:
 *         description: Danh sách danh mục sách theo trường và giá trị chỉ định
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

  CategoryModel.getListByFieldWithLimitOffset(
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
 * /category/create:
 *   post:
 *     summary: Tạo mới một danh mục sách
 *     tags: [Category]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: category_name
 *         type: string
 *         required: true
 *         description: Tên của danh mục sách
 *       - in: formData
 *         name: illustration
 *         type: file
 *         description: Hình ảnh minh họa cho danh mục sách
 *     responses:
 *       201:
 *         description: Danh mục sách được tạo thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/create", upload.single("illustration"), (req, res) => {
  console.log("File uploaded:", req.file);
  console.log("Request body:", req.body);
  const { category_name } = req.body;
  const illustration = req.file ? req.file.path : ""; // Lưu đường dẫn của file ảnh vào trường illustration
  const newCategory = { category_name, illustration };

  CategoryModel.create(newCategory, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /category/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin của một danh mục sách
 *     tags: [Category]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của danh mục sách cần cập nhật
 *       - in: formData
 *         name: category_name
 *         type: string
 *         description: Tên của danh mục sách
 *       - in: formData
 *         name: illustration
 *         type: file
 *         description: Hình ảnh minh họa cho danh mục sách
 *     responses:
 *       200:
 *         description: Danh mục sách được cập nhật thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/update/:id", upload.single("illustration"), (req, res) => {
  const id = req.params.id;
  const updatedCategory = req.body;
  if (req.file) {
    updatedCategory.illustration = req.file.path; // Lưu đường dẫn của file ảnh vào trường illustration
  }

  CategoryModel.update(id, updatedCategory, (result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /category/status/{id}:
 *   put:
 *     summary: Cập nhật trạng thái của một danh mục sách
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của danh mục sách
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       404:
 *         description: Không tìm thấy danh mục sách với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/status/:id", (req, res) => {
  const id = req.params.id;

  CategoryModel.getDetail(id, (result) => {
    if (!result.success) {
      return res.status(404).json(result);
    }

    // Chuyển đổi trạng thái
    const newStatus = result.data.status === 0 ? 1 : 0;

    CategoryModel.updateStatus(id, newStatus, (result) => {
      res.status(result.success ? 200 : 400).json(result);
    });
  });
});

/**
 * @swagger
 * /category/trash/{id}:
 *   put:
 *     summary: Cập nhật trạng thái trash của một danh mục sách
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của danh mục sách
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái trash thành công
 *       404:
 *         description: Không tìm thấy danh mục sách với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/trash/:id", (req, res) => {
  const id = req.params.id;

  CategoryModel.getDetail(id, (result) => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    // Chuyển đổi trạng thái trash
    const newStatus = result.data.trash === 0 ? 1 : 0;

    CategoryModel.updateTrash(id, newStatus, (result) => {
      res.status(result.success ? 200 : 400).json(result);
    });
  });
});
/**
 * @swagger
 * /category/delete/{id}:
 *   delete:
 *     summary: Xóa một danh mục sách
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của danh mục sách cần xóa
 *     responses:
 *       200:
 *         description: Xóa danh mục sách thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  CategoryModel.delete(id, (result) => {
    res.status(200).json(result);
  });
});

module.exports = router;
