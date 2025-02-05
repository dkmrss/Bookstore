const db = require("../configs/database");
const userSchema = require("../schemas/UsersSchema");
const fs = require('fs');
const path = require("path");
const md5 = require("md5");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
class UserModel {
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

  static transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  static async sendActivationEmail(email, token) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Kích hoạt tài khoản của bạn",
      text: `Chào bạn, vui lòng sử dụng mã kích hoạt sau để kích hoạt tài khoản của bạn: ${token}.`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log("Activation email sent successfully");
    } catch (err) {
      console.error("Error sending activation email:", err.message);
    }
  }

  static async handleImageDeletion(imagePath) {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  static async handleErrorWithImageDeletion(err, avatar, errorMessage, callback) {
    if (avatar) {
      const imagePath = path.join(__dirname, "..", "..", "..", avatar);
      await this.handleImageDeletion(imagePath);
    }
    callback({
      data: [],
      message: errorMessage,
      success: false,
      error: err.details ? err.details[0].message : err.message,
    });
  }

  static async getAll(callback) {
    try {
      const rows = await this.executeQuery("SELECT * FROM users");
      callback({
        data: rows,
        message: "Danh sách người dùng đã được lấy thành công",
        success: true,
        error: "",
        totalCount: rows.length,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách người dùng",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async getById(id, callback) {
    try {
      const rows = await this.executeQuery("SELECT * FROM users WHERE id = ?", [id]);
      if (rows.length === 0) {
        return callback({
          data: {},
          message: "Không tìm thấy người dùng",
          success: false,
          error: "",
        });
      }
      callback({
        data: rows[0],
        message: "Thông tin người dùng đã được lấy thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: {},
        message: "Không thể lấy thông tin người dùng",
        success: false,
        error: err.message,
      });
    }
  }

  // static async create(newUser, callback) {
  //   const { email, password, name, phone, address, avatar } = newUser;
  //   const { error } = userSchema.validate(newUser);
  //   if (error) {
  //     return this.handleErrorWithImageDeletion(error, avatar, "Dữ liệu không hợp lệ", callback);
  //   }
  
  //   try {
  //     // Kiểm tra email đã tồn tại
  //     const existingUsers = await this.executeQuery("SELECT * FROM users WHERE email = ?", [email]);
  //     if (existingUsers.length > 0) {
  //       return this.handleErrorWithImageDeletion(new Error("Email đã tồn tại"), avatar, "Email đã tồn tại", callback);
  //     }
  
  //     // Mã hóa mật khẩu bằng MD5
  //     const hashedPassword = md5(password);
  
  //     // Thêm người dùng mới với mật khẩu đã mã hóa
  //     const result = await this.executeQuery("INSERT INTO users SET ?", {
  //       email,
  //       password: hashedPassword,
  //       name,
  //       phone,
  //       address,
  //       avatar,
  //     });
  
  //     callback({
  //       data: result.insertId,
  //       message: "Người dùng đã được thêm thành công",
  //       success: true,
  //       error: "",
  //     });
  //   } catch (err) {
  //     return this.handleErrorWithImageDeletion(err, avatar, "Không thể thêm người dùng", callback);
  //   }
  // }

  static async create(newUser, callback) {
    const { email, password, name, phone, address, avatar } = newUser;
    const { error } = userSchema.validate(newUser);
    if (error) {
      return this.handleErrorWithImageDeletion(error, avatar, "Dữ liệu không hợp lệ", callback);
    }

    try {
      const existingUsers = await this.executeQuery("SELECT * FROM users WHERE email = ?", [email]);
      if (existingUsers.length > 0) {
        return this.handleErrorWithImageDeletion(new Error("Email đã tồn tại"), avatar, "Email đã tồn tại", callback);
      }

      const hashedPassword = md5(password);
      const result = await this.executeQuery("INSERT INTO users SET ?", {
        email,
        password: hashedPassword,
        name,
        phone,
        address,
        avatar,
        status: 1, // Đặt trạng thái ban đầu là chưa kích hoạt
      });

      // Tạo mã kích hoạt dưới dạng JWT
      const activationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

      // Gửi email kích hoạt
      await this.sendActivationEmail(email, activationToken);

      callback({
        data: result.insertId,
        message: "Người dùng đã được thêm thành công. Email kích hoạt đã được gửi.",
        success: true,
        error: "",
      });
    } catch (err) {
      return this.handleErrorWithImageDeletion(err, avatar, "Không thể thêm người dùng", callback);
    }
  }


  static async update(id, updatedUser, callback) {
    try {
      const rows = await this.executeQuery("SELECT avatar FROM users WHERE id = ?", [id]);
      if (rows.length === 0) {
        return this.handleErrorWithImageDeletion(new Error("Không tìm thấy người dùng"), updatedUser.avatar, "Không tìm thấy người dùng", callback);
      }

      if (!updatedUser.avatar) {
        updatedUser.avatar = rows[0].avatar;
      }

      const result = await this.executeQuery("UPDATE users SET ? WHERE id = ?", [updatedUser, id]);
      if (result.affectedRows === 0) {
        return this.handleErrorWithImageDeletion(new Error("Không tìm thấy người dùng để cập nhật"), updatedUser.avatar, "Không tìm thấy người dùng để cập nhật", callback);
      }
      callback({
        data: id,
        message: "Thông tin người dùng đã được cập nhật thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      return this.handleErrorWithImageDeletion(err, updatedUser.avatar, "Không thể cập nhật thông tin người dùng", callback);
    }
  }

  static async delete(id, callback) {
    if (id === 1 || id === "1") {
      return callback({
        success: true,
        message: "Không thể xóa người dùng đặc biệt",
        error: "",
      });
    }
    try {
      // Xóa chi tiết đơn hàng
      await this.executeQuery("DELETE FROM order_details WHERE order_id IN (SELECT id FROM orders WHERE customer_id = ?)", [id]);
      // Xóa đơn hàng
      await this.executeQuery("DELETE FROM orders WHERE customer_id = ?", [id]);
      // Xóa người dùng
      const result = await this.executeQuery("DELETE FROM users WHERE id = ?", [id]);
      if (result.affectedRows === 0) {
        return callback({
          data: [],
          message: "Không tìm thấy người dùng để xóa",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "Người dùng đã được xóa thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể xóa người dùng",
        success: false,
        error: err.message,
      });
    }
  }

  static async toggleStatus(id, callback) {
    if (id === 1 || id === "1") {
      return callback({
        success: true,
        message: "Không thể thay đổi trạng thái người dùng đặc biệt",
        error: "",
      });
    }
  
    try {
      const result = await this.executeQuery("UPDATE users SET status = NOT status WHERE id = ?", [id]);
      if (result.affectedRows === 0) {
        return callback({
          success: false,
          message: "Không tìm thấy người dùng để cập nhật trạng thái",
          error: "",
        });
      }
      callback({
        success: true,
        message: "Trạng thái người dùng đã được cập nhật thành công",
        data: id,
      });
    } catch (err) {
      callback({
        success: false,
        message: "Không thể cập nhật trạng thái người dùng",
        error: err.message,
      });
    }
  }

  static async toggleRole(id, callback) {
    
    if (id === 1 || id === "1") {
      return callback({
        success: true,
        message: "Không thể thay đổi vai trò người dùng đặc biệt",
        error: "",
      });
    }
    else{try {
      const result = await this.executeQuery("UPDATE users SET role = NOT role WHERE id = ?", [id]);
      if (result.affectedRows === 0) {
        return callback({
          data: [],
          message: "Không tìm thấy người dùng để cập nhật vai trò",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "Vai trò người dùng đã được cập nhật thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể cập nhật vai trò người dùng",
        success: false,
        error: err.message,
      });
    }}
    
  }

  static async getListWithLimitOffset(limit, offset, callback) {
    try {
      const rows = await this.executeQuery("SELECT * FROM users LIMIT ? OFFSET ?", [limit, offset]);
      const countResult = await this.executeQuery("SELECT COUNT(*) as totalCount FROM users");
      callback({
        data: rows,
        message: "Danh sách người dùng đã được lấy thành công",
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách người dùng",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }
}

module.exports = UserModel;
