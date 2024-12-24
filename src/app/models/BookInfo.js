const db = require("../configs/database");
const BookInfoSchema = require("../schemas/BookInfoSchema");
const fs = require("fs");
const path = require("path");

class BookInfoModel {
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

  static async getList(callback) {
    try {
      const rows = await this.executeQuery("SELECT * FROM book_info");
      callback({
        data: rows,
        message: "Danh sách thông tin sách đã được lấy thành công",
        success: true,
        error: "",
        totalCount: rows.length,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách thông tin sách",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async getDetail(id, callback) {
    try {
      const rows = await this.executeQuery(
        "SELECT * FROM book_info WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        return callback({
          data: {},
          message: "Không tìm thấy thông tin sách",
          success: false,
          error: "",
        });
      }
      callback({
        data: rows[0],
        message: "Thông tin thông tin sách đã được lấy thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: {},
        message: "Không thể lấy thông tin thông tin sách",
        success: false,
        error: err.message,
      });
    }
  }

  static async getListWithLimitOffset(limit, offset, callback) {
    try {
      const rows = await this.executeQuery(
        "SELECT * FROM book_info LIMIT ? OFFSET ?",
        [limit, offset]
      );
      const countResult = await this.executeQuery(
        "SELECT COUNT(*) as totalCount FROM book_info"
      );
      callback({
        data: rows,
        message: "Danh sách thông tin sách đã được lấy thành công",
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách thông tin sách",
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

  static async create(newBookInfo, callback) {
    const { error } = BookInfoSchema.validate(newBookInfo);
    if (error) {
      if (newBookInfo.book_images) {
        const imagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          newBookInfo.book_images
        );
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
      const result = await this.executeQuery(
        "INSERT INTO book_info SET ?",
        newBookInfo
      );
      callback({
        data: result.insertId,
        message: "thông tin sách đã được thêm thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      if (newBookInfo.book_images) {
        const imagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          newBookInfo.book_images
        );
        await this.handleImageDeletion(imagePath);
      }
      callback({
        data: [],
        message: "Không thể thêm thông tin sách",
        success: false,
        error: err.message,
      });
    }
  }

  static async update(id, updatedBookInfo, callback) {
    try {
      const rows = await this.executeQuery(
        "SELECT book_images FROM book_info WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        if (updatedBookInfo.book_images) {
          const imagePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            updatedBookInfo.book_images
          );
          await this.handleImageDeletion(imagePath);
        }
        return callback({
          data: [],
          message: "Không tìm thấy thông tin sách",
          success: false,
          error: "",
        });
      }

      if (!updatedBookInfo.book_images) {
        updatedBookInfo.book_images = rows[0].book_images;
      }

      const result = await this.executeQuery(
        "UPDATE book_info SET ? WHERE id = ?",
        [updatedBookInfo, id]
      );
      if (result.affectedRows === 0) {
        if (updatedBookInfo.book_images) {
          const imagePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            updatedBookInfo.book_images
          );
          await this.handleImageDeletion(imagePath);
        }
        return callback({
          data: [],
          message: "Không tìm thấy thông tin sách dùng để cập nhật",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "Thông tin thông tin sách đã được cập nhật thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      if (updatedBookInfo.book_images) {
        const imagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          updatedBookInfo.book_images
        );
        await this.handleImageDeletion(imagePath);
      }
      callback({
        data: [],
        message: "Không thể cập nhật thông tin sách",
        success: false,
        error: err.message,
      });
    }
  }

  static async delete(id, callback) {
    try {
      const result = await this.executeQuery(
        "DELETE FROM book_info WHERE id = ?",
        [id]
      );
      if (result.affectedRows === 0) {
        return callback({
          data: [],
          message: "Không tìm thấy thông tin sách để xóa",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "thông tin sách đã được xóa thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể xóa thông tin sách",
        success: false,
        error: err.message,
      });
    }
  }

  static async updateField(id, field, value, callback) {
    try {
      const result = await this.executeQuery(
        `UPDATE book_info SET ${field} = ? WHERE id = ?`,
        [value, id]
      );
      if (result.affectedRows === 0) {
        return callback({
          data: [],
          message: `Không tìm thấy thông tin sách để cập nhật ${field}`,
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: `Trạng thái ${field} của thông tin sách đã được cập nhật thành công`,
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: [],
        message: `Không thể cập nhật ${field} của thông tin sách`,
        success: false,
        error: err.message,
      });
    }
  }

  static updateType(id, types, callback) {
    this.updateField(id, "types", types, callback);
  }

  static updateTrash(id, trash, callback) {
    this.updateField(id, "trash", trash, callback);
  }

  static async getListByField(field, value, callback) {
    try {
      const rows = await this.executeQuery(
        `SELECT * FROM book_info WHERE ${field} = ?`,
        [value]
      );
      callback({
        data: rows,
        message: `Danh sách thông tin sách theo ${field} đã được lấy thành công`,
        success: true,
        error: "",
        totalCount: rows.length,
      });
    } catch (err) {
      callback({
        data: [],
        message: `Không thể lấy danh sách thông tin sách theo ${field}`,
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static getListByStatus(status, callback) {
    this.getListByField("status", status, callback);
  }

  static getListByTrash(trash, callback) {
    this.getListByField("trash", trash, callback);
  }

  static async getListByFieldWithLimitOffset(
    field,
    value,
    limit,
    offset,
    callback
  ) {
    try {
      const query = `SELECT * FROM book_info WHERE ${field} = ? LIMIT ? OFFSET ?`;
      const rows = await this.executeQuery(query, [value, limit, offset]);
      const countQuery = `SELECT COUNT(*) as totalCount FROM book_info WHERE ${field} = ?`;
      const countResult = await this.executeQuery(countQuery, [value]);
      callback({
        data: rows,
        message: `Danh sách thông tin sách theo ${field} đã được lấy thành công`,
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: `Không thể lấy danh sách thông tin sách theo ${field}`,
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
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
    const query = `SELECT * FROM book_info WHERE ${whereClauses} LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as totalCount FROM book_info WHERE ${whereClauses}`;

    const queryParams = [...values, limit, offset];
    const countParams = values;

    db.query(query, queryParams, (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách thông tin sách",
          success: false,
          error: err.message,
        });
      }
      db.query(countQuery, countParams, (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng thông tin sách",
            success: false,
            error: err.message,
          });
        }
        const totalCount = countResult[0].totalCount;
        callback({
          data: rows,
          message: "Danh sách thông tin sách đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }
}

module.exports = BookInfoModel;
