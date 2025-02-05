const db = require("../configs/database");

class RatingModel {
    static async create(newRating, callback) {
        try {
          const { user_id, product_id } = newRating;
      
          // Kiểm tra xem người dùng đã mua sản phẩm hay chưa
          const checkQuery = `
            SELECT COUNT(*) as purchaseCount
            FROM orders o
            JOIN order_details od ON o.id = od.order_id
            WHERE o.customer_id = ? AND od.product_id = ? AND o.delivered = 0
          `;
    
          const purchaseResult = await new Promise((resolve, reject) => {
            db.query(checkQuery, [user_id, product_id], (err, result) => {
              if (err) reject(err);
              else resolve(result[0]);
            });
          });
          
          if (purchaseResult.purchaseCount === 0) {
            return callback({
              success: true,
              message: "Người dùng chưa mua sản phẩm này, không thể đánh giá",
              error: "",
            });
          }
    
          // Nếu đã mua, thêm đánh giá
          const query = "INSERT INTO rating SET ?";
          const result = await new Promise((resolve, reject) => {
            db.query(query, newRating, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
    
          callback({
            success: true,
            message: "Đánh giá đã được thêm thành công",
            data: { id: result.insertId },
          });
        } catch (err) {
          callback({
            success: false,
            message: "Không thể thêm đánh giá",
            error: err.message,
          });
        }
      }

      static async getListByProduct(productId, limit, offset, callback) {
        try {
          const usePagination = limit !== undefined && offset !== undefined;
          let query, queryParams;
      
          if (usePagination) {
            query = `
              SELECT r.*, u.name AS user_name, u.avatar 
              FROM rating r 
              JOIN users u ON r.user_id = u.id 
              WHERE r.product_id = ? 
              LIMIT ? OFFSET ?
            `;
            queryParams = [productId, limit, offset];
          } else {
            query = `
              SELECT r.*, u.name AS user_name, u.avatar 
              FROM rating r 
              JOIN users u ON r.user_id = u.id 
              WHERE r.product_id = ?
            `;
            queryParams = [productId];
          }
      
          const countQuery = `
            SELECT COUNT(*) as totalCount 
            FROM rating 
            WHERE product_id = ?
          `;
      
          const ratings = await new Promise((resolve, reject) => {
            db.query(query, queryParams, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
      
          const count = await new Promise((resolve, reject) => {
            db.query(countQuery, [productId], (err, result) => {
              if (err) reject(err);
              else resolve(result[0].totalCount);
            });
          });
      
          callback({
            success: true,
            message: "Danh sách đánh giá đã được lấy thành công",
            data: ratings,
            totalCount: count,
          });
        } catch (err) {
          callback({
            success: false,
            message: "Không thể lấy danh sách đánh giá",
            error: err.message,
          });
        }
      }

  static async delete(id, callback) {
    try {
      const query = "DELETE FROM rating WHERE id = ?";
      const result = await new Promise((resolve, reject) => {
        db.query(query, [id], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      if (result.affectedRows === 0) {
        return callback({
          success: false,
          message: "Không tìm thấy đánh giá để xóa",
          error: "",
        });
      }

      callback({
        success: true,
        message: "Đánh giá đã được xóa thành công",
        data: id,
      });
    } catch (err) {
      callback({
        success: false,
        message: "Không thể xóa đánh giá",
        error: err.message,
      });
    }
  }
}

module.exports = RatingModel;
