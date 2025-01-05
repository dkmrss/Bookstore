const db = require("../configs/database");
const userCommentSchema = require("../schemas/UserComment");

class UserCommentModel {
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
    const query = "SELECT * FROM comment";
    const countQuery = "SELECT COUNT(*) as totalCount FROM comment";
    db.query(query, [], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách bình luận của người dùng",
          success: false,
          error: err.message,
        });
      }
      db.query(countQuery, [], (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng bình luận của người dùng",
            success: false,
            error: err.message,
          });
        }
        const totalCount = countResult[0].totalCount;
        callback({
          data: rows,
          message: "Danh sách bình luận của người dùng đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }

  static getById(id, callback) {
    this.executeQuery(
      "SELECT * FROM comment WHERE id = ?",
      [id],
      "Thông tin bình luận của người dùng đã được lấy thành công",
      "Không thể lấy thông tin bình luận của người dùng",
      (response) => {
        if (response.data.length === 0) {
          return callback({
            data: {},
            message: "Không tìm thấy bình luận của người dùng",
            success: false,
            error: "",
          });
        }
        response.data = response.data[0];
        callback(response);
      }
    );
  }

  static create(newComment, callback) {
    const { error } = userCommentSchema.validate(newComment);
    if (error) {
      return callback({
        data: [],
        message: "Dữ liệu không hợp lệ",
        success: false,
        error: error.details[0].message,
      });
    }

    this.executeQuery(
      "INSERT INTO comment SET ?",
      newComment,
      "Bình luận của người dùng đã được thêm thành công",
      "Không thể thêm bình luận của người dùng",
      (response) => {
        response.data = response.data.insertId;
        callback(response);
      }
    );
  }

  static update(id, updatedComment, callback) {
    this.executeQuery(
      "UPDATE comment SET ? WHERE id = ?",
      [updatedComment, id],
      "Thông tin bình luận của người dùng đã được cập nhật thành công",
      "Không thể cập nhật thông tin bình luận của người dùng",
      (response) => {
        if (response.data.affectedRows === 0) {
          return callback({
            data: [],
            message: "Không tìm thấy bình luận của người dùng để cập nhật",
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
      "DELETE FROM comment WHERE id = ?",
      [id],
      "Bình luận của người dùng đã được xóa thành công",
      "Không thể xóa bình luận của người dùng",
      (response) => {
        if (response.data.affectedRows === 0) {
          return callback({
            data: [],
            message: "Không tìm thấy bình luận của người dùng để xóa",
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
  const query = `
    SELECT 
      comment.*, 
      users.name AS user_name, 
      users.avatar AS user_avatar 
    FROM 
      comment
    JOIN 
      users 
    ON 
      comment.user_id = users.id
    LIMIT ? OFFSET ?`;

  const countQuery = "SELECT COUNT(*) as totalCount FROM comment";

  db.query(query, [limit, offset], (err, rows) => {
    if (err) {
      return callback({
        data: [],
        message: "Không thể lấy danh sách bình luận của người dùng",
        success: false,
        error: err.message,
      });
    }

    db.query(countQuery, [], (err, countResult) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể đếm số lượng bình luận của người dùng",
          success: false,
          error: err.message,
        });
      }

      const totalCount = countResult[0].totalCount;

      callback({
        data: rows,
        message: "Danh sách bình luận của người dùng đã được lấy thành công",
        success: true,
        error: "",
        totalCount: totalCount,
      });
    });
  });
}


  static getListWithLimitOffsetByField(field, value, limit, offset, callback) {
    const query = `SELECT * FROM comment WHERE ${field} = ? LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as totalCount FROM comment WHERE ${field} = ?`;
    db.query(query, [value, limit, offset], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách bình luận của người dùng",
          success: false,
          error: err.message,
        });
      }
      db.query(countQuery, [value], (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng bình luận của người dùng",
            success: false,
            error: err.message,
          });
        }
        const totalCount = countResult[0].totalCount;
        callback({
          data: rows,
          message: "Danh sách bình luận của người dùng đã được lấy thành công",
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
    const query = `
      SELECT 
        c.*, 
        u.name AS user_name, 
        u.avatar AS user_avatar 
      FROM 
        comment c
      JOIN 
        users u 
      ON 
        c.user_id = u.id
      WHERE 
        ${whereClauses} 
      LIMIT ? OFFSET ?
    `;
    const countQuery = `
      SELECT 
        COUNT(*) as totalCount 
      FROM 
        comment c
      JOIN 
        users u 
      ON 
        c.user_id = u.id
      WHERE 
        ${whereClauses}
    `;
  
    const queryParams = [...values, limit, offset];
    const countParams = values;
  
    db.query(query, queryParams, (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách bình luận",
          success: false,
          error: err.message,
        });
      }
      db.query(countQuery, countParams, (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng bình luận",
            success: false,
            error: err.message,
          });
        }
        const totalCount = countResult[0].totalCount;
        callback({
          data: rows,
          message: "Danh sách bình luận đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }
  
}

module.exports = UserCommentModel;
