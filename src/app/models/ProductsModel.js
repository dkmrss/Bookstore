const db = require("../configs/database");
const productSchema = require("../schemas/ProductSchema");
const fs = require("fs");
const path = require("path");

class ProductsModel {
  static async executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  static async getAll(callback) {
    try {
      const rows = await this.executeQuery("SELECT * FROM products");
      const countResult = await this.executeQuery(
        "SELECT COUNT(*) as totalCount FROM products"
      );
      callback({
        data: rows,
        message: "Danh sách sản phẩm đã được lấy thành công",
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách sản phẩm",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async getById(id, callback) {
    try {
      const rows = await this.executeQuery("SELECT * FROM products WHERE id = ?", [id]);
      if (rows.length === 0) {
        return callback({
          data: {},
          message: "Không tìm thấy sản phẩm",
          success: false,
          error: "",
        });
      }
      callback({
        data: rows[0],
        message: "Thông tin sản phẩm đã được lấy thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: {},
        message: "Không thể lấy thông tin sản phẩm",
        success: false,
        error: err.message,
      });
    }
  }

  static async create(newProduct, callback) {
    const { error } = productSchema.validate(newProduct);
    if (error) {
      if (newProduct.image) {
        const imagePath = path.join(__dirname, "..", "..", newProduct.image);
        await this.handleImageDeletion(imagePath);
      }
      return callback({
        data: [],
        message: "Dữ liệu không hợp lệ",
        success: false,
        error: error.details[0].message,
      });
    }
    try {
      const result = await this.executeQuery("INSERT INTO products SET ?", newProduct);
      callback({
        data: result.insertId,
        message: "Sản phẩm đã được thêm thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      if (newProduct.image) {
        const imagePath = path.join(__dirname, "..", "..", newProduct.image);
        await this.handleImageDeletion(imagePath);
      }
      callback({
        data: [],
        message: "Không thể thêm sản phẩm",
        success: false,
        error: err.message,
      });
    }
  }

  static async update(id, updatedProduct, callback) {
    try {
      const rows = await this.executeQuery("SELECT image FROM products WHERE id = ?", [id]);
      if (rows.length === 0) {
        if (updatedProduct.image) {
          const imagePath = path.join(__dirname, "..", "..", updatedProduct.image);
          await this.handleImageDeletion(imagePath);
        }
        return callback({
          data: [],
          message: "Không tìm thấy sản phẩm",
          success: false,
          error: "",
        });
      }

      if (!updatedProduct.image) {
        updatedProduct.image = rows[0].image;
      }

      const result = await this.executeQuery("UPDATE products SET ? WHERE id = ?", [updatedProduct, id]);
      if (result.affectedRows === 0) {
        if (updatedProduct.image) {
          const imagePath = path.join(__dirname, "..", "..", updatedProduct.image);
          await this.handleImageDeletion(imagePath);
        }
        return callback({
          data: [],
          message: "Không tìm thấy sản phẩm để cập nhật",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "Thông tin sản phẩm đã được cập nhật thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      if (updatedProduct.image) {
        const imagePath = path.join(__dirname, "..", "..", updatedProduct.image);
        await this.handleImageDeletion(imagePath);
      }
      callback({
        data: [],
        message: "Không thể cập nhật sản phẩm",
        success: false,
        error: err.message,
      });
    }
  }

  static async delete(id, callback) {
    try {
      const result = await this.executeQuery("DELETE FROM products WHERE id = ?", [id]);
      if (result.affectedRows === 0) {
        return callback({
          data: [],
          message: "Không tìm thấy sản phẩm để xóa",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "Sản phẩm đã được xóa thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể xóa sản phẩm",
        success: false,
        error: err.message,
      });
    }
  }

  static async getListWithLimitOffset(limit, offset, callback) {
    try {
      const rows = await this.executeQuery("SELECT * FROM products LIMIT ? OFFSET ?", [limit, offset]);
      const countResult = await this.executeQuery("SELECT COUNT(*) as totalCount FROM products");
      callback({
        data: rows,
        message: "Danh sách sản phẩm đã được lấy thành công",
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách sản phẩm",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async getNewProducts(limit, offset, callback) {
    try {
      const rows = await this.executeQuery(
        "SELECT * FROM products WHERE status=0 AND trash=0 ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [limit, offset]
      );
      const countResult = await this.executeQuery(
        "SELECT COUNT(*) as totalCount FROM products WHERE status=0 AND trash=0"
      );
      callback({
        data: rows,
        message: "Danh sách sản phẩm mới đã được lấy thành công",
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách sản phẩm mới",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async getSaleProducts(limit, offset, callback) {
    try {
      const rows = await this.executeQuery(
        "SELECT * FROM products WHERE sale=1 AND status=0 AND trash=0 ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [limit, offset]
      );
      const countResult = await this.executeQuery(
        "SELECT COUNT(*) as totalCount FROM products WHERE sale=1 AND status=0 AND trash=0"
      );
      callback({
        data: rows,
        message: "Danh sách sản phẩm sale đã được lấy thành công",
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách sản phẩm sale",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async getProductsByCategory(category, limit, offset, callback) {
    try {
      const rows = await this.executeQuery(
        "SELECT * FROM products WHERE category_id=? AND status=0 AND trash=0  LIMIT ? OFFSET ?",
        [category, limit, offset]
      );
      const countResult = await this.executeQuery(
        "SELECT COUNT(*) as totalCount FROM products WHERE category_id=? AND status=0 AND trash=0 ",
        [category]
      );
      callback({
        data: rows,
        message: "Danh sách sản phẩm theo danh mục đã được lấy thành công",
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách sản phẩm theo danh mục",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static getRecommend(userId, limit, offset, callback) {
    const query = `
        SELECT DISTINCT p.*
        FROM orders o
        JOIN order_details od ON o.id = od.order_id
        JOIN products p ON od.product_id = p.id
        WHERE o.customer_id = ?
        AND p.category_id IN (
            SELECT DISTINCT p.category_id
            FROM orders o
            JOIN order_details od ON o.id = od.order_id
            JOIN products p ON od.product_id = p.id
            WHERE o.customer_id = ?
        )
        AND p.id NOT IN (
            SELECT DISTINCT p.id
            FROM orders o
            JOIN order_details od ON o.id = od.order_id
            JOIN products p ON od.product_id = p.id
            WHERE o.customer_id = ?
        )
        UNION
        SELECT DISTINCT p.*
        FROM products p
        WHERE p.category_id IN (
            SELECT DISTINCT p.category_id
            FROM orders o
            JOIN order_details od ON o.id = od.order_id
            JOIN products p ON od.product_id = p.id
            WHERE o.customer_id = ?
        )
        AND p.id NOT IN (
            SELECT DISTINCT p.id
            FROM orders o
            JOIN order_details od ON o.id = od.order_id
            JOIN products p ON od.product_id = p.id
            WHERE o.customer_id = ?
        )
        AND p.trash = 0
        AND p.status = 0
        LIMIT ? OFFSET ?;
    `;

    const countQuery = `
        SELECT COUNT(*) as totalCount
        FROM (
            SELECT DISTINCT p.*
            FROM orders o
            JOIN order_details od ON o.id = od.order_id
            JOIN products p ON od.product_id = p.id
            WHERE o.customer_id = ?
            AND p.category_id IN (
                SELECT DISTINCT p.category_id
                FROM orders o
                JOIN order_details od ON o.id = od.order_id
                JOIN products p ON od.product_id = p.id
                WHERE o.customer_id = ?
            )
            AND p.id NOT IN (
                SELECT DISTINCT p.id
                FROM orders o
                JOIN order_details od ON o.id = od.order_id
                JOIN products p ON od.product_id = p.id
                WHERE o.customer_id = ?
            )
            UNION
            SELECT DISTINCT p.*
            FROM products p
            WHERE p.category_id IN (
                SELECT DISTINCT p.category_id
                FROM orders o
                JOIN order_details od ON o.id = od.order_id
                JOIN products p ON od.product_id = p.id
                WHERE o.customer_id = ?
            )
            AND p.id NOT IN (
                SELECT DISTINCT p.id
                FROM orders o
                JOIN order_details od ON o.id = od.order_id
                JOIN products p ON od.product_id = p.id
                WHERE o.customer_id = ?
            )
            AND p.trash = 0
            AND p.status = 0
        ) as temp;
    `;

    db.query(
      query,
      [userId, userId, userId, userId, userId, limit, offset],
      (err, rows) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể lấy danh sách sản phẩm đề xuất",
            success: false,
            error: err.message,
          });
        }
        db.query(
          countQuery,
          [userId, userId, userId, userId, userId],
          (err, countResult) => {
            if (err) {
              return callback({
                data: [],
                message: "Không thể đếm số lượng sản phẩm đề xuất",
                success: false,
                error: err.message,
              });
            }
            const totalCount = countResult[0].totalCount;
            callback({
              data: rows,
              message: "Danh sách sản phẩm đề xuất đã được lấy thành công",
              success: true,
              error: "",
              totalCount: totalCount,
            });
          }
        );
      }
    );
  }

  static async search(searchTerm, limit, offset, callback) {
    try {
      const likeTerm = `%${searchTerm}%`;
      const rows = await this.executeQuery(
        "SELECT * FROM products WHERE trash=0 AND status=0 AND (product_name LIKE ? OR publisher LIKE ? OR author LIKE ?) LIMIT ? OFFSET ?",
        [likeTerm, likeTerm, likeTerm, limit, offset]
      );
      const countResult = await this.executeQuery(
        "SELECT COUNT(*) as totalCount FROM products WHERE trash=0 AND status=0 AND (product_name LIKE ? OR publisher LIKE ? OR author LIKE ?)",
        [likeTerm, likeTerm, likeTerm]
      );
      callback({
        data: rows,
        message: "Kết quả tìm kiếm đã được lấy thành công",
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể tìm kiếm sản phẩm",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async handleImageDeletion(imagePath) {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
}

module.exports = ProductsModel;
