const express = require("express");
const router = express.Router();
const NewModel = require("../models/NewModel");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/News/"); // Thư mục để lưu trữ file ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tên file sẽ được lưu trữ
  },
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   name: News
 *   description: Quản lý tin tức
 */

/**
 * @swagger
 * /news/get-list:
 *   get:
 *     summary: Lấy danh sách tất cả tin tức
 *     tags: [News]
 *     responses:
 *       200:
 *         description: Danh sách các tin tức
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-list", (req, res) => {
  NewModel.getList((result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /news/new-detail/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết của tin tức
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của tin tức cần lấy thông tin chi tiết
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của tin tức
 *       404:
 *         description: Không tìm thấy tin tức với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/new-detail/:id", (req, res) => {
  const id = req.params.id;
  NewModel.getDetail(id, (result) => {
    res.status(200).json(result);
  });
});
/**
 * @swagger
 * /news/get-lists:
 *   get:
 *     summary: Lấy danh sách tin tức với giới hạn và lệch cho phân trang
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         description: Số lượng tin tức cần lấy
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Số lượng tin tức cần bỏ qua
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Trạng thái tin tức
 *       - in: query
 *         name: trash
 *         schema:
 *           type: integer
 *         description: Trạng thái trash của tin tức
 *     responses:
 *       200:
 *         description: Danh sách tin tức
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
    NewModel.getListWithLimitOffsetByFields(
      fields,
      values,
      take,
      skip,
      (result) => {
        res.status(result.success ? 200 : 400).json(result);
      }
    );
  } else {
    NewModel.getListWithLimitOffset(take, skip, (result) => {
      res.status(200).json(result);
    });
  }
});
/**
 * @swagger
 * /news/get-list-by-field:
 *   get:
 *     summary: Lấy danh sách tin tức theo trường và giá trị chỉ định
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *         required: true
 *         description: Tên trường cần lấy tin tức
 *       - in: query
 *         name: value
 *         schema:
 *           type: string
 *         required: true
 *         description: Giá trị của trường cần lấy tin tức
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         required: true
 *         description: Số lượng tin tức cần lấy
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         required: true
 *         description: Số lượng tin tức cần bỏ qua
 *     responses:
 *       200:
 *         description: Danh sách tin tức theo trường và giá trị chỉ định
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

  NewModel.getListByFieldWithLimitOffset(
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
 * /news/create:
 *   post:
 *     summary: Tạo tin tức mới
 *     tags: [News]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: avatar
 *         type: file
 *         description: Ảnh đại diện của tin tức
 *       - in: formData
 *         name: title
 *         type: string
 *         description: Tiêu đề tin tức
 *       - in: formData
 *         name: short_description
 *         type: string
 *         description: Mô tả ngắn của tin tức
 *       - in: formData
 *         name: content
 *         type: string
 *         description: Nội dung tin tức
 *     responses:
 *       201:
 *         description: Tin tức được tạo thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/create", upload.single("avatar"), (req, res) => {
  const { title, short_description, content } = req.body;
  const avatar = req.file ? req.file.path : ""; // Lưu đường dẫn của file ảnh vào trường avatar

  const newNew = { title, short_description, content, avatar };

  NewModel.create(newNew, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /news/update/{id}:
 *   put:
 *     summary: Cập nhật tin tức
 *     tags: [News]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của tin tức cần cập nhật
 *       - in: formData
 *         name: avatar
 *         type: file
 *         description: Ảnh đại diện của tin tức
 *       - in: formData
 *         name: title
 *         type: string
 *         description: Tiêu đề tin tức
 *       - in: formData
 *         name: short_description
 *         type: string
 *         description: Mô tả ngắn của tin tức
 *       - in: formData
 *         name: content
 *         type: string
 *         description: Nội dung tin tức
 *     responses:
 *       200:
 *         description: Tin tức được cập nhật thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/update/:id", upload.single("avatar"), (req, res) => {
  const id = req.params.id;
  const updatedNew = req.body;
  if (req.file) {
    updatedNew.avatar = req.file.path; // Lưu đường dẫn của file ảnh vào trường avatar
  }

  NewModel.update(id, updatedNew, (result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /news/status/{id}:
 *   put:
 *     summary: Cập nhật trạng thái của tin tức
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của tin tức
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái của tin tức thành công
 *       404:
 *         description: Không tìm thấy tin tức với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/status/:id", (req, res) => {
  const id = req.params.id;

  NewModel.getDetail(id, (result) => {
    if (!result.success) {
      return res.status(404).json(result);
    }

    // Chuyển đổi trạng thái
    const newStatus = result.data.status === 0 ? 1 : 0;

    NewModel.updateStatus(id, newStatus, (result) => {
      res.status(result.success ? 200 : 400).json(result);
    });
  });
});

/**
 * @swagger
 * /news/trash/{id}:
 *   put:
 *     summary: Cập nhật trạng thái trash của tin tức
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của tin tức
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái trash của tin tức thành công
 *       404:
 *         description: Không tìm thấy tin tức với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/trash/:id", (req, res) => {
  const id = req.params.id;

  NewModel.getDetail(id, (result) => {
    if (!result.success) {
      return res.status(404).json(result);
    }

    // Chuyển đổi trạng thái
    const newStatus = result.data.trash === 0 ? 1 : 0;

    NewModel.updateTrash(id, newStatus, (result) => {
      res.status(result.success ? 200 : 400).json(result);
    });
  });
});

/**
 * @swagger
 * /news/delete/{id}:
 *   delete:
 *     summary: Xóa tin tức
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của tin tức cần xóa
 *     responses:
 *       200:
 *         description: Xóa tin tức thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  NewModel.delete(id, (result) => {
    res.status(200).json(result);
  });
});

module.exports = router;
