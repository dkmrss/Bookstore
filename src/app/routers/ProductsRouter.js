const express = require("express");
const router = express.Router();
const ProductsModel = require("../models/ProductsModel");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/ProductImage/"); // Thư mục để lưu trữ file ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tên file sẽ được lưu trữ
  },
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Quản lý sản phẩm
 */

/**
 * @swagger
 * /products/get-list:
 *   get:
 *     summary: Lấy danh sách tất cả sản phẩm
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Danh sách các sản phẩm
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-list", (req, res) => {
  ProductsModel.getAll((result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /products/product-detail/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết của sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của sản phẩm cần lấy thông tin chi tiết
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của sản phẩm
 *       404:
 *         description: Không tìm thấy sản phẩm với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/product-detail/:id", (req, res) => {
  const id = req.params.id;
  ProductsModel.getById(id, (result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /products/get-list-with-limit-offset:
 *   get:
 *     summary: Lấy danh sách sản phẩm với phân trang
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm cần lấy
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm cần bỏ qua
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm với phân trang
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-list-with-limit-offset", (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
  
    ProductsModel.getListWithLimitOffset(limit, offset, (result) => {
      res.status(200).json(result);
    });
  });


/**
 * @swagger
 * /products/get-products-by-category:
 *   get:
 *     summary: Lấy danh sách sản phẩm mới
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Mã thể loại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm cần lấy
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm cần bỏ qua
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm mới
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-products-by-category", (req, res) => {
  const category = parseInt(req.query.category) || 0;
  const limit = parseInt(req.query.limit) || 5;
  const offset = parseInt(req.query.offset) || 0;
  ProductsModel.getProductsByCategory(category, limit, offset, (result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /products/get-new-products:
 *   get:
 *     summary: Lấy danh sách sản phẩm mới
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm cần lấy (mặc định 5)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Vị trí bắt đầu lấy sản phẩm (mặc định 0)
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm mới
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-new-products", (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const offset = parseInt(req.query.offset) || 0;
  ProductsModel.getNewProducts(limit, offset, (result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /products/get-sale-products:
 *   get:
 *     summary: Lấy danh sách sản phẩm đang giảm giá
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm cần lấy (mặc định 10)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Vị trí bắt đầu lấy sản phẩm (mặc định 0)
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm giảm giá
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-sale-products", (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  ProductsModel.getSaleProducts(limit, offset, (result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /products/get-recommend-products:
 *   get:
 *     summary: Lấy danh sách sản phẩm đề xuất
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID người dùng
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm cần lấy
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm cần bỏ qua
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm đề xuất
 *       400:
 *         description: Thiếu thông tin người dùng
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-recommend-products", (req, res) => {
  const userId = parseInt(req.query.userId);
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  if (!userId) {
    return res.status(400).json({
      data: [],
      message: "Thiếu thông tin người dùng",
      success: false,
      error: "Missing userId",
    });
  }

  ProductsModel.getRecommend(userId, limit, offset, (result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /products/create:
 *   post:
 *     summary: Tạo sản phẩm mới
 *     tags: [Products]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         description: Ảnh của sản phẩm
 *       - in: formData
 *         name: product_name
 *         type: string
 *         description: Tên sản phẩm
 *       - in: formData
 *         name: price
 *         type: number
 *         description: Giá sản phẩm
 *     responses:
 *       201:
 *         description: Sản phẩm được tạo thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/create", upload.single("image"), (req, res) => {
  const { product_name, price, ...rest } = req.body;
  const image = req.file ? req.file.path : "";
  const newProduct = { product_name, price, image, ...rest };

  ProductsModel.create(newProduct, (result) => {
    res.status(result.success ? 201 : 400).json(result);
  });
});

/**
 * @swagger
 * /products/update/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm
 *     tags: [Products]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của sản phẩm cần cập nhật
 *       - in: formData
 *         name: image
 *         type: file
 *         description: Ảnh của sản phẩm
 *       - in: formData
 *         name: product_name
 *         type: string
 *         description: Tên sản phẩm
 *       - in: formData
 *         name: price
 *         type: number
 *         description: Giá sản phẩm
 *     responses:
 *       200:
 *         description: Sản phẩm được cập nhật thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/update/:id", upload.single("image"), (req, res) => {
  const id = req.params.id;
  const updatedProduct = req.body;

  if (req.file) {
    updatedProduct.image = req.file.path;
  }

  ProductsModel.update(id, updatedProduct, (result) => {
    res.status(result.success ? 200 : 400).json(result);
  });
});

/**
 * @swagger
 * /products/delete/{id}:
 *   delete:
 *     summary: Xóa sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của sản phẩm cần xóa
 *     responses:
 *       200:
 *         description: Sản phẩm được xóa thành công
 *       404:
 *         description: Không tìm thấy sản phẩm với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  ProductsModel.delete(id, (result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Tìm kiếm sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         required: true
 *         description: Từ khóa tìm kiếm
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm cần lấy
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm cần bỏ qua
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm sản phẩm
 *       400:
 *         description: Thiếu từ khóa tìm kiếm
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/search", (req, res) => {
    const searchTerm = req.query.searchTerm;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
  
    if (!searchTerm) {
      return res.status(400).json({
        data: [],
        message: "Thiếu từ khóa tìm kiếm",
        success: false,
        error: "Missing searchTerm",
      });
    }
  
    ProductsModel.search(searchTerm, limit, offset, (result) => {
      res.status(200).json(result);
    });
  });

module.exports = router;
