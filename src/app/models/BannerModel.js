const db = require("../configs/database");
const bannerSchema = require("../schemas/BannerSchema");
const fs = require("fs");
const path = require("path");

class BannerModel {
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

  static async handleImageDeletion(imagePath) {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  static async getList(callback) {
    try {
      const rows = await this.executeQuery("SELECT * FROM banner");
      callback({
        data: rows,
        message: "Danh sách banner đã được lấy thành công",
        success: true,
        error: "",
        totalCount: rows.length,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách banner",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async getDetail(id, callback) {
    try {
      const rows = await this.executeQuery(
        "SELECT * FROM banner WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        return callback({
          data: {},
          message: "Không tìm thấy banner",
          success: false,
          error: "",
        });
      }
      callback({
        data: rows[0],
        message: "Thông tin banner đã được lấy thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: {},
        message: "Không thể lấy thông tin banner",
        success: false,
        error: err.message,
      });
    }
  }

  static async getActiveBanners(limit, offset, callback) {
    try {
      const query = `
        SELECT image, title 
        FROM banner 
        WHERE status = 0 AND trash = 0 
        AND date_end > NOW() 
        AND date_start < NOW() 
        ORDER BY date_end ASC 
        LIMIT ? OFFSET ?
      `;
      const rows = await this.executeQuery(query, [limit, offset]);
      const countResult = await this.executeQuery(
        `SELECT COUNT(*) as totalCount FROM banner 
         WHERE status = 0 AND trash = 0 
         AND date_end > NOW() 
         AND date_start < NOW()`
      );
      callback({
        data: rows,
        message: "Danh sách banner còn hạn đã được lấy thành công",
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách banner còn hạn",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async getListWithLimitOffset(limit, offset, callback) {
    try {
      const rows = await this.executeQuery(
        "SELECT * FROM banner LIMIT ? OFFSET ?",
        [limit, offset]
      );
      const countResult = await this.executeQuery(
        "SELECT COUNT(*) as totalCount FROM banner"
      );
      callback({
        data: rows,
        message: "Danh sách banner đã được lấy thành công",
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách banner",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async create(newBanner, callback) {
    const { error } = bannerSchema.validate(newBanner);
    if (error) {
      if (newBanner.image) {
        const imagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          newBanner.image
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
        "INSERT INTO banner SET ?",
        newBanner
      );
      callback({
        data: result.insertId,
        message: "Banner đã được thêm thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      if (newBanner.image) {
        const imagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          newBanner.image
        );
        await this.handleImageDeletion(imagePath);
      }
      callback({
        data: [],
        message: "Không thể thêm banner",
        success: false,
        error: err.message,
      });
    }
  }

  static async update(id, updatedBanner, callback) {
    try {
      const rows = await this.executeQuery(
        "SELECT image FROM banner WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        if (updatedBanner.image) {
          const imagePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            updatedBanner.image
          );
          await this.handleImageDeletion(imagePath);
        }
        return callback({
          data: [],
          message: "Không tìm thấy banner",
          success: false,
          error: "",
        });
      }

      if (!updatedBanner.image) {
        updatedBanner.image = rows[0].image;
      }

      const result = await this.executeQuery(
        "UPDATE banner SET ? WHERE id = ?",
        [updatedBanner, id]
      );
      if (result.affectedRows === 0) {
        if (updatedBanner.image) {
          const imagePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            updatedBanner.image
          );
          await this.handleImageDeletion(imagePath);
        }
        return callback({
          data: [],
          message: "Không tìm thấy banner dùng để cập nhật",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "Thông tin banner đã được cập nhật thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      if (updatedBanner.image) {
        const imagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          updatedBanner.image
        );
        await this.handleImageDeletion(imagePath);
      }
      callback({
        data: [],
        message: "Không thể cập nhật banner",
        success: false,
        error: err.message,
      });
    }
  }

  static async delete(id, callback) {
    try {
      const result = await this.executeQuery(
        "DELETE FROM banner WHERE id = ?",
        [id]
      );
      if (result.affectedRows === 0) {
        return callback({
          data: [],
          message: "Không tìm thấy banner để xóa",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "Banner đã được xóa thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể xóa banner",
        success: false,
        error: err.message,
      });
    }
  }

  static async updateField(id, field, value, callback) {
    try {
      const result = await this.executeQuery(
        `UPDATE banner SET ${field} = ? WHERE id = ?`,
        [value, id]
      );
      if (result.affectedRows === 0) {
        return callback({
          data: [],
          message: `Không tìm thấy banner để cập nhật ${field}`,
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: `Trạng thái ${field} của banner đã được cập nhật thành công`,
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: [],
        message: `Không thể cập nhật ${field} của banner`,
        success: false,
        error: err.message,
      });
    }
  }

  static updateStatus(id, status, callback) {
    this.updateField(id, "status", status, callback);
  }

  static updateTrash(id, trash, callback) {
    this.updateField(id, "trash", trash, callback);
  }

  static async getListByField(field, value, callback) {
    try {
      const rows = await this.executeQuery(
        `SELECT * FROM banner WHERE ${field} = ?`,
        [value]
      );
      callback({
        data: rows,
        message: `Danh sách banner theo ${field} đã được lấy thành công`,
        success: true,
        error: "",
        totalCount: rows.length,
      });
    } catch (err) {
      callback({
        data: [],
        message: `Không thể lấy danh sách banner theo ${field}`,
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
      const query = `SELECT * FROM banner WHERE ${field} = ? LIMIT ? OFFSET ?`;
      const rows = await this.executeQuery(query, [value, limit, offset]);
      const countQuery = `SELECT COUNT(*) as totalCount FROM banner WHERE ${field} = ?`;
      const countResult = await this.executeQuery(countQuery, [value]);
      callback({
        data: rows,
        message: `Danh sách banner theo ${field} đã được lấy thành công`,
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: `Không thể lấy danh sách banner theo ${field}`,
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
    const query = `SELECT * FROM banner WHERE ${whereClauses} LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as totalCount FROM banner WHERE ${whereClauses}`;

    const queryParams = [...values, limit, offset];
    const countParams = values;

    db.query(query, queryParams, (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách banner",
          success: false,
          error: err.message,
        });
      }
      db.query(countQuery, countParams, (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng banner",
            success: false,
            error: err.message,
          });
        }
        const totalCount = countResult[0].totalCount;
        callback({
          data: rows,
          message: "Danh sách banner đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }
}

module.exports = BannerModel;
