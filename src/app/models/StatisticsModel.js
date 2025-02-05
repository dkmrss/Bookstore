const db = require("../configs/database");

class StatisticsModel {
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

  static async getTotalProductsSold(callback) {
    try {
      const query = `
            SELECT 
              COUNT(DISTINCT od.product_id) AS totalProductsSold,
              SUM(od.quantity) AS totalQuantitySold
            FROM order_details od;
          `;
      const result = await this.executeQuery(query);
      callback({
        success: true,
        message: "Tổng số lượng sản phẩm đã bán được lấy thành công",
        data: result[0],
      });
    } catch (err) {
      callback({
        success: false,
        message: "Không thể lấy tổng số lượng sản phẩm đã bán",
        error: err.message,
      });
    }
  }

  static async getOrderCountByStatus(callback) {
    try {
      const query = `
            SELECT 
              delivered,
              COUNT(*) AS orderCount
            FROM orders
            GROUP BY delivered;
          `;
      const result = await this.executeQuery(query);
      callback({
        success: true,
        message: "Số lượng đơn hàng theo trạng thái đã được lấy thành công",
        data: result,
      });
    } catch (err) {
      callback({
        success: false,
        message: "Không thể lấy số lượng đơn hàng theo trạng thái",
        error: err.message,
      });
    }
  }

  static async getBestSellingBooks(limit, callback) {
    try {
      const query = `
            SELECT 
              p.id, 
              p.product_name, 
              SUM(od.quantity) AS totalSold
            FROM products p
            JOIN order_details od ON p.id = od.product_id
            GROUP BY p.id
            ORDER BY totalSold DESC
            LIMIT ?;
          `;
      const result = await this.executeQuery(query, [limit]);
      callback({
        success: true,
        message: "Danh sách sách bán chạy đã được lấy thành công",
        data: result,
      });
    } catch (err) {
      callback({
        success: false,
        message: "Không thể lấy danh sách sách bán chạy",
        error: err.message,
      });
    }
  }

  static async getTopKeywords(limit, callback) {
    try {
      const query = `
            SELECT keyword, time_search
            FROM search_keywords
            ORDER BY time_search DESC
            LIMIT ?;
          `;
      const result = await this.executeQuery(query, [limit]);
      callback({
        success: true,
        message: "Danh sách từ khóa tìm kiếm nhiều nhất đã được lấy thành công",
        data: result,
      });
    } catch (err) {
      callback({
        success: false,
        message: "Không thể lấy danh sách từ khóa tìm kiếm",
        error: err.message,
      });
    }
  }
  static async getMonthlyRevenue(callback) {
    try {
      const query = `
        SELECT 
          DATE_FORMAT(order_date, '%Y-%m') AS month,
          SUM(total) AS revenue
        FROM orders
        WHERE delivered = 3
          AND order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(order_date, '%Y-%m')
        ORDER BY month DESC;
      `;
  
      const result = await this.executeQuery(query);
  
      callback({
        success: true,
        message: "Doanh thu theo từng tháng trong 6 tháng gần nhất đã được lấy thành công",
        data: result,
      });
    } catch (err) {
      callback({
        success: false,
        message: "Không thể lấy doanh thu theo từng tháng",
        error: err.message,
      });
    }
  }

  static async getDailyRevenue(callback) {
    try {
      const query = `
            SELECT 
              DATE(order_date) AS day,
              SUM(total) AS revenue
            FROM orders
            WHERE delivered = 3
            AND DATE(order_date) = CURDATE();
          `;
      const result = await this.executeQuery(query);
      callback({
        success: true,
        message: "Doanh thu trong ngày đã được lấy thành công",
        data: result,
      });
    } catch (err) {
      callback({
        success: false,
        message: "Không thể lấy doanh thu trong ngày",
        error: err.message,
      });
    }
  }
}

module.exports = StatisticsModel;
