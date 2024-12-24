const db = require("../configs/database");

class CartModel {
    static addToCart(userId, productId, quantity, callback) {
        // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng hay chưa
        const checkQuery = `
          SELECT * FROM cart WHERE user_id = ? AND product_id = ?
        `;
      
        db.query(checkQuery, [userId, productId], (err, rows) => {
          if (err) {
            return callback({
              success: false,
              message: "Không thể kiểm tra giỏ hàng",
              error: err.message,
            });
          }
      
          if (rows.length > 0) {
            // Nếu sản phẩm đã tồn tại, cập nhật số lượng
            const updateQuery = `
              UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?
            `;
            db.query(updateQuery, [quantity, userId, productId], (err, result) => {
              if (err) {
                return callback({
                  success: false,
                  message: "Không thể cập nhật số lượng sản phẩm trong giỏ hàng",
                  error: err.message,
                });
              }
              callback({
                success: true,
                message: "Số lượng sản phẩm trong giỏ hàng đã được cập nhật thành công",
                data: result,
              });
            });
          } else {
            // Nếu sản phẩm chưa tồn tại, thêm mới vào giỏ hàng
            const insertQuery = `
              INSERT INTO cart (user_id, product_id, quantity)
              VALUES (?, ?, ?)
            `;
            db.query(insertQuery, [userId, productId, quantity], (err, result) => {
              if (err) {
                return callback({
                  success: false,
                  message: "Không thể thêm sản phẩm vào giỏ hàng",
                  error: err.message,
                });
              }
              callback({
                success: true,
                message: "Sản phẩm đã được thêm vào giỏ hàng thành công",
                data: result,
              });
            });
          }
        });
      }

  static getCart(userId, callback) {
    const query = `
      SELECT c.id, c.quantity, p.product_name, p.price, p.saleprice, p.image
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `;
    db.query(query, [userId], (err, rows) => {
      if (err) {
        return callback({
          success: false,
          message: "Không thể lấy giỏ hàng",
          error: err.message,
        });
      }
      callback({
        success: true,
        message: "Lấy giỏ hàng thành công",
        data: rows,
      });
    });
  }

  static updateCartItem(userId, productId, quantity, callback) {
    const query = `
      UPDATE cart
      SET quantity = ?
      WHERE user_id = ? AND product_id = ?
    `;
    db.query(query, [quantity, userId, productId], (err, result) => {
      if (err) {
        return callback({
          success: false,
          message: "Không thể cập nhật giỏ hàng",
          error: err.message,
        });
      }
      if (result.affectedRows === 0) {
        return callback({
          success: false,
          message: "Không tìm thấy sản phẩm để cập nhật",
          error: "",
        });
      }
      callback({
        success: true,
        message: "Cập nhật giỏ hàng thành công",
        data: result,
      });
    });
  }

  static removeCartItem(userId, productId, callback) {
    const query = `DELETE FROM cart WHERE user_id = ? AND product_id = ?`;
    db.query(query, [userId, productId], (err, result) => {
      if (err) {
        return callback({
          success: false,
          message: "Không thể xóa sản phẩm khỏi giỏ hàng",
          error: err.message,
        });
      }
      if (result.affectedRows === 0) {
        return callback({
          success: false,
          message: "Sản phẩm không tồn tại trong giỏ hàng",
        });
      }
      callback({
        success: true,
        message: "Xóa sản phẩm khỏi giỏ hàng thành công",
        data: result,
      });
    });
  }

  static clearCart(userId, callback) {
    const query = `
      DELETE FROM cart WHERE user_id = ?
    `;
    db.query(query, [userId], (err, result) => {
      if (err) {
        return callback({
          success: false,
          message: "Không thể xóa giỏ hàng",
          error: err.message,
        });
      }
      callback({
        success: true,
        message: "Giỏ hàng đã được xóa thành công",
        data: result,
      });
    });
  }

  static viewCart(userId, callback) {
    const query = `
      SELECT c.id AS cart_id, c.quantity, 
             p.id AS product_id, p.product_name, 
             p.image, p.price, p.saleprice,
             (c.quantity * (p.price - (p.price * (p.saleprice / 100)))) AS total_price
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `;

    db.query(query, [userId], (err, rows) => {
      if (err) {
        return callback({
          success: false,
          message: "Không thể lấy danh sách giỏ hàng",
          error: err.message,
        });
      }

      const totalCartValue = rows.reduce((total, item) => total + item.total_price, 0);

      callback({
        success: true,
        message: "Danh sách giỏ hàng đã được lấy thành công",
        data: {
          cartItems: rows,
          totalCartValue: totalCartValue,
        },
      });
    });
  }
}

module.exports = CartModel;
