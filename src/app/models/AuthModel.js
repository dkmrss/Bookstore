const db = require("../configs/database");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
require("dotenv").config();

class AuthModel {
  static async login(email, password, callback) {
    try {
      const query = "SELECT * FROM users WHERE email = ?";
      const users = await new Promise((resolve, reject) => {
        db.query(query, [email], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      if (users.length === 0) {
        return callback({
          success: false,
          message: "Email không tồn tại",
          error: "",
          token: null,
        });
      }

      const user = users[0];
      const hashedPassword = md5(password);
      if (user.password !== hashedPassword) {
        return callback({
          success: false,
          message: "Mật khẩu không đúng",
          error: "",
          token: null,
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      callback({
        success: true,
        message: "Đăng nhập thành công",
        error: "",
        token: token,
        data: {
          id: user.id,
          email: user.email,
          avatar: user.avatar,
          name: user.name,
          role: user.role,
        },
      });
    } catch (err) {
      callback({
        success: false,
        message: "Lỗi khi xử lý đăng nhập",
        error: err.message,
        token: null,
      });
    }
  }


  static async logout(token, callback) {
    try {
      // Implement a blacklist or token invalidation logic
      callback({
        success: true,
        message: "Đăng xuất thành công",
        error: "",
      });
    } catch (err) {
      callback({
        success: false,
        message: "Lỗi khi xử lý đăng xuất",
        error: err.message,
      });
    }
  }

  static async forgotPassword(email, callback) {
    try {
      // Generate a reset token (example logic)
      const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });

      // Here, save the token in the database or send via email

      callback({
        success: true,
        message: "Token đặt lại mật khẩu đã được gửi",
        error: "",
        data: { resetToken },
      });
    } catch (err) {
      callback({
        success: false,
        message: "Lỗi khi xử lý quên mật khẩu",
        error: err.message,
      });
    }
  }

  static async resetPassword(resetToken, newPassword, callback) {
    try {
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

      const hashedPassword = md5(newPassword);
      const query = "UPDATE users SET password = ? WHERE email = ?";
      db.query(query, [hashedPassword, decoded.email], (err, result) => {
        if (err) {
          return callback({
            success: false,
            message: "Lỗi khi đặt lại mật khẩu",
            error: err.message,
          });
        }
        callback({
          success: true,
          message: "Mật khẩu đã được đặt lại thành công",
          error: "",
        });
      });
    } catch (err) {
      callback({
        success: false,
        message: "Lỗi khi xác thực token đặt lại mật khẩu",
        error: err.message,
      });
    }
  }
}

module.exports = AuthModel;
