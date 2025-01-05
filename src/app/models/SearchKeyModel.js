const db = require("../configs/database");

class SearchKeyModel {
  // Thực thi truy vấn với promise
  static executeQuery(query, params) {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  // Lấy danh sách từ khóa tìm kiếm
  static async getKeywords(limit, offset, callback) {
    try {
      const keywords = await this.executeQuery(
        "SELECT * FROM search_keywords ORDER BY time_search DESC LIMIT ? OFFSET ?",
        [limit, offset]
      );

      const countResult = await this.executeQuery(
        "SELECT COUNT(*) as totalCount FROM search_keywords"
      );

      callback({
        data: keywords,
        message: "Danh sách từ khóa đã được lấy thành công",
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách từ khóa",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  // Xóa từ khóa tìm kiếm
  static async deleteKeyword(keywordId, callback) {
    try {
      const result = await this.executeQuery(
        "DELETE FROM search_keywords WHERE id = ?",
        [keywordId]
      );

      if (result.affectedRows === 0) {
        return callback({
          success: false,
          message: "Không tìm thấy từ khóa để xóa",
          error: "",
        });
      }

      callback({
        success: true,
        message: "Từ khóa đã được xóa thành công",
        error: "",
      });
    } catch (err) {
      callback({
        success: false,
        message: "Không thể xóa từ khóa",
        error: err.message,
      });
    }
  }

  
 
}

module.exports = SearchKeyModel;
