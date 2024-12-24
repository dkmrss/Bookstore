const db = require("../configs/database");
const OrderSchema = require("../schemas/OrderSchema");

class OrderModel {
  static executeQuery(query, params, successMessage, errorMessage, callback) {
    db.query(query, params, (err, result) => {
      if (err) {
        return callback({
          data: [],
          message: errorMessage,
          success: false,
          error: err.message,
        });
      }
      callback({
        data: result,
        message: successMessage,
        success: true,
        error: "",
      });
    });
  }

  static getAll(callback) {
    const query = "SELECT * FROM orders";
    const countQuery = "SELECT COUNT(*) as totalCount FROM orders";
    db.query(query, [], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách đơn hàng",
          success: false,
          error: err.message,
        });
      }
      db.query(countQuery, [], (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng đơn hàng",
            success: false,
            error: err.message,
          });
        }
        const totalCount = countResult[0].totalCount;
        callback({
          data: rows,
          message: "Danh sách đơn hàng đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }

  static getById(id, callback) {
    this.executeQuery(
      "SELECT * FROM orders WHERE id = ?",
      [id],
      "Thông tin đơn hàng đã được lấy thành công",
      "Không thể lấy thông tin đơn hàng",
      (response) => {
        if (response.data.length === 0) {
          return callback({
            data: {},
            message: "Không tìm thấy đơn hàng",
            success: false,
            error: "",
          });
        }
        response.data = response.data[0];
        callback(response);
      }
    );
  }

  static create(newOrder, orderDetails, callback) {
    const { error } = OrderSchema.validate(newOrder);
    if (error) {
      return callback({
        success: false,
        message: "Dữ liệu không hợp lệ",
        error: error.details[0].message,
      });
    }
  
    const queryInsertOrder = "INSERT INTO orders SET ?";
    const queryInsertOrderDetails = "INSERT INTO order_details (order_id, product_id, quantity, price) VALUES ?";
    const queryDeleteCart = "DELETE FROM cart WHERE user_id = ?";
    const queryUpdateProductQuantity = "UPDATE products SET quantity = quantity - ? WHERE id = ?";
    const queryGetOrderDetails = "SELECT * FROM orders WHERE id = ?";
  
    db.beginTransaction((err) => {
      if (err) {
        return callback({
          success: false,
          message: "Không thể bắt đầu giao dịch",
          error: err.message,
        });
      }
  
      // Tạo đơn hàng
      db.query(queryInsertOrder, newOrder, (err, result) => {
        if (err) {
          return db.rollback(() => {
            callback({
              success: false,
              message: "Không thể tạo đơn hàng",
              error: err.message,
            });
          });
        }
  
        const orderId = result.insertId;
  
        // Chuẩn bị dữ liệu cho bảng order_details
        const orderDetailsValues = orderDetails.map((item) => [
          orderId,
          item.product_id,
          item.quantity,
          item.price,
        ]);
  
        // Thêm order_details
        db.query(queryInsertOrderDetails, [orderDetailsValues], (err) => {
          if (err) {
            return db.rollback(() => {
              callback({
                success: false,
                message: "Không thể thêm chi tiết đơn hàng",
                error: err.message,
              });
            });
          }
  
          // Xóa giỏ hàng
          db.query(queryDeleteCart, [newOrder.customer_id], (err) => {
            if (err) {
              return db.rollback(() => {
                callback({
                  success: false,
                  message: "Không thể xóa giỏ hàng",
                  error: err.message,
                });
              });
            }
  
            // Giảm số lượng sản phẩm trong kho
            const updateProductTasks = orderDetails.map((item) =>
              new Promise((resolve, reject) => {
                db.query(queryUpdateProductQuantity, [item.quantity, item.product_id], (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              })
            );
  
            Promise.all(updateProductTasks)
              .then(() => {
                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      callback({
                        success: false,
                        message: "Không thể hoàn tất giao dịch",
                        error: err.message,
                      });
                    });
                  }
  
                  // Lấy chi tiết đơn hàng vừa tạo
                  db.query(queryGetOrderDetails, [orderId], (err, rows) => {
                    if (err) {
                      return callback({
                        success: false,
                        message: "Không thể lấy chi tiết đơn hàng",
                        error: err.message,
                      });
                    }
  
                    callback({
                      success: true,
                      message: "Đơn hàng đã được tạo thành công",
                      data: rows[0], // Trả về đầy đủ chi tiết đơn hàng
                    });
                  });
                });
              })
              .catch((err) => {
                db.rollback(() => {
                  callback({
                    success: false,
                    message: "Không thể cập nhật số lượng sản phẩm",
                    error: err.message,
                  });
                });
              });
          });
        });
      });
    });
  }
  

  static update(id, updatedOrder, callback) {
    this.executeQuery(
      "UPDATE orders SET ? WHERE id = ?",
      [updatedOrder, id],
      "Thông tin đơn hàng đã được cập nhật thành công",
      "Không thể cập nhật thông tin đơn hàng",
      (response) => {
        if (response.data.affectedRows === 0) {
          return callback({
            data: [],
            message: "Không tìm thấy đơn hàng để cập nhật",
            success: false,
            error: "",
          });
        }
        response.data = id;
        callback(response);
      }
    );
  }

  static delete(id, callback) {
    this.executeQuery(
      "DELETE FROM orders WHERE id = ?",
      [id],
      "đơn hàng đã được xóa thành công",
      "Không thể xóa đơn hàng",
      (response) => {
        if (response.data.affectedRows === 0) {
          return callback({
            data: [],
            message: "Không tìm thấy đơn hàng để xóa",
            success: false,
            error: "",
          });
        }
        response.data = id;
        callback(response);
      }
    );
  }

  static getListWithLimitOffset(limit, offset, callback) {
    const query = "SELECT * FROM orders LIMIT ? OFFSET ?";
    const countQuery = "SELECT COUNT(*) as totalCount FROM orders";
    db.query(query, [limit, offset], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách đơn hàng",
          success: false,
          error: err.message,
        });
      }
      db.query(countQuery, [], (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng đơn hàng",
            success: false,
            error: err.message,
          });
        }
        const totalCount = countResult[0].totalCount;
        callback({
          data: rows,
          message: "Danh sách đơn hàng đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }

  static getListWithLimitOffsetByField(field, value, limit, offset, callback) {
    const query = `SELECT * FROM orders WHERE ${field} = ? LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as totalCount FROM orders WHERE ${field} = ?`;
    db.query(query, [value, limit, offset], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách đơn hàng",
          success: false,
          error: err.message,
        });
      }
      db.query(countQuery, [value], (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng đơn hàng",
            success: false,
            error: err.message,
          });
        }
        const totalCount = countResult[0].totalCount;
        callback({
          data: rows,
          message: "Danh sách đơn hàng đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }

  static getListWithLimitOffsetByFields(
    fields,
    values,
    limit,
    offset,
    callback
  ) {
    if (fields.length !== values.length) {
      return callback({
        data: [],
        message: "Số lượng fields và values không khớp",
        success: false,
        error: "Invalid input",
      });
    }

    const whereClauses = fields.map((field) => `${field} = ?`).join(" AND ");
    const query = `SELECT * FROM orders WHERE ${whereClauses} LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as totalCount FROM orders WHERE ${whereClauses}`;

    const queryParams = [...values, limit, offset];
    const countParams = values;

    db.query(query, queryParams, (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách đơn hàng",
          success: false,
          error: err.message,
        });
      }
      db.query(countQuery, countParams, (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng đơn hàng",
            success: false,
            error: err.message,
          });
        }
        const totalCount = countResult[0].totalCount;
        callback({
          data: rows,
          message: "Danh sách đơn hàng đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }
}

module.exports = OrderModel;
