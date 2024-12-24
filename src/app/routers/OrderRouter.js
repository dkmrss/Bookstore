const express = require("express");
const router = express.Router();
const OrderModel = require("../models/OrderModel");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Quản lý đơn hàng của người dùng
 */

/**
 * @swagger
 * /orders/get-list:
 *   get:
 *     summary: Lấy danh sách tất cả đơn hàng
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Danh sách các đơn hàng
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-list", (req, res) => {
  OrderModel.getAll((result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /orders/order-detail/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết của một đơn hàng
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của đơn hàng cần lấy thông tin
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của đơn hàng
 *       404:
 *         description: Không tìm thấy đơn hàng với ID cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/order-detail/:id", (req, res) => {
  const id = req.params.id;
  OrderModel.getById(id, (result) => {
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /orders/get-list-by-field:
 *   get:
 *     summary: Lấy danh sách đơn hàng theo trường và giá trị chỉ định
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *         required: true
 *         description: Tên trường cần lấy thông tin đơn hàng
 *       - in: query
 *         name: value
 *         schema:
 *           type: string
 *         required: true
 *         description: Giá trị của trường cần lấy thông tin đơn hàng
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         required: true
 *         description: Số lượng đơn hàng cần lấy
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         required: true
 *         description: Số lượng đơn hàng cần bỏ qua
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng theo trường và giá trị chỉ định
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

  OrderModel.getListWithLimitOffsetByField(
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
 * /orders/get-lists:
 *   get:
 *     summary: Lấy danh sách đơn hàng với giới hạn và phân trang
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         required: true
 *         description: Số lượng đơn hàng cần lấy
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         required: true
 *         description: Số lượng đơn hàng cần bỏ qua
 *       - in: query
 *         name: delivered
 *         schema:
 *           type: boolean
 *         description: Trạng thái giao hàng (true/false)
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *         description: Phương thức thanh toán
 *       - in: query
 *         name: payment
 *         schema:
 *           type: string
 *         description: Phương thức thanh toán
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: integer
 *         description: ID của khách hàng đặt hàng
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Số điện thoại của khách hàng
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng với giới hạn và phân trang
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/get-lists", (req, res) => {
  const take = parseInt(req.query.take);
  const skip = parseInt(req.query.skip);
  const delivered = req.query.delivered;
  const method = req.query.method;
  const payment = req.query.payment;
  const customer_id = req.query.customer_id;
  const phone = req.query.phone;

  const fields = [];
  const values = [];

  if (phone) {
    fields.push("phone");
    values.push(phone);
  }

  if (delivered) {
    fields.push("delivered");
    values.push(delivered);
  }

  if (method) {
    fields.push("method");
    values.push(method);
  }

  if (payment) {
    fields.push("payment");
    values.push(payment);
  }

  if (customer_id) {
    fields.push("customer_id");
    values.push(customer_id);
  }

  if (fields.length > 0) {
    OrderModel.getListWithLimitOffsetByFields(
      fields,
      values,
      take,
      skip,
      (result) => {
        res.status(result.success ? 200 : 400).json(result);
      }
    );
  } else {
    OrderModel.getListWithLimitOffset(take, skip, (result) => {
      res.status(200).json(result);
    });
  }
});

/**
 * @swagger
 * /orders/create:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: integer
 *               total:
 *                 type: number
 *               method:
 *                 type: integer
 *               payment:
 *                 type: integer
 *               note:
 *                 type: string
 *               orderDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *     responses:
 *       200:
 *         description: Đơn hàng được tạo thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/create", (req, res) => {
  const { customer_id, total, method, payment, note, orderDetails, name, phone, address } = req.body;

  if (
    typeof customer_id !== "number" ||
    typeof name !== "string" ||
    typeof phone !== "string" ||
    typeof address !== "string" ||
    typeof total !== "number" ||
    typeof method !== "number" ||
    typeof payment !== "number" ||
    !Array.isArray(orderDetails) ||
    orderDetails.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ. Vui lòng kiểm tra các trường bắt buộc.",
      error: "Thiếu dữ liệu hoặc dữ liệu không hợp lệ.",
    });
  }

  const newOrder = {
    customer_id,
    name,
    phone,
    address,
    total,
    method,
    payment,
    note,
  };

  OrderModel.create(newOrder, orderDetails, (result) => {
    res.status(result.success ? 200 : 500).json(result);
  });
});

/**
 * @swagger
 * /orders/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin của một đơn hàng
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của đơn hàng cần cập nhật thông tin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Định nghĩa các thuộc tính của đơn hàng cần cập nhật ở đây
 *     responses:
 *       200:
 *         description: Thông tin của đơn hàng được cập nhật thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/update/:id", (req, res) => {
  const id = req.params.id;
  const updatedOrder = req.body;
  OrderModel.update(id, updatedOrder, (result) => {
    res.status(result.success ? 200 : 400).json(result);
  });
});

/**
 * @swagger
 * /orders/delete/{id}:
 *   delete:
 *     summary: Xóa một đơn hàng
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của đơn hàng cần xóa
 *     responses:
 *       200:
 *         description: Đơn hàng được xóa thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  OrderModel.delete(id, (result) => {
    res.status(200).json(result);
  });
});

module.exports = router;
