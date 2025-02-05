const db = require("../configs/database");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
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

      // Kiểm tra trạng thái của tài khoản
      if (user.status === 1) {
        return callback({
          success: false,
          message:
            "Tài khoản của bạn đã chưa kích hoạt, vui lòng chọn phần kích hoạt tài khoản",
          error: "",
          token: null,
        });
      }

      // Kiểm tra mật khẩu
      const hashedPassword = md5(password);
      if (user.password !== hashedPassword) {
        return callback({
          success: false,
          message: "Mật khẩu không đúng",
          error: "",
          token: null,
        });
      }

      // Tạo token
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

  static transporter = nodemailer.createTransport({
    service: "Gmail", // Có thể đổi sang dịch vụ email khác như Outlook, Yahoo...
    auth: {
      user: process.env.EMAIL_USER, // Địa chỉ email
      pass: process.env.EMAIL_PASSWORD, // Mật khẩu email hoặc App Password
    },
  });

  static async forgotPassword(email, callback) {
    try {
      // Tạo reset token
      const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });

      // Tùy chọn email
      const mailOptions = {
        from: process.env.EMAIL_USER, // Người gửi
        to: email, // Người nhận
        subject: "Đặt lại mật khẩu của bạn",
        text: `Chào bạn, Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã token sau để đặt lại mật khẩu của bạn:
                
        ${resetToken}

        Lưu ý: Mã token này chỉ có hiệu lực trong 15 phút.

        Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.

        Trân trọng,
        Hệ thống hỗ trợ`,
      };

      // Gửi email
      await this.transporter.sendMail(mailOptions);

      callback({
        success: true,
        message: "Token đặt lại mật khẩu đã được gửi tới email của bạn",
        error: "",
      });
    } catch (err) {
      callback({
        success: false,
        message: "Lỗi khi xử lý quên mật khẩu",
        error: err.message,
      });
    }
  }

  static async changePassword(userId, oldPassword, newPassword, callback) {
    try {
      const queryGetUser = "SELECT * FROM users WHERE id = ?";
      const user = await new Promise((resolve, reject) => {
        db.query(queryGetUser, [userId], (err, result) => {
          if (err) return reject(err);
          resolve(result[0]);
        });
      });

      if (!user) {
        return callback({
          success: false,
          message: "Người dùng không tồn tại",
          error: "",
        });
      }

      const hashedOldPassword = md5(oldPassword);
      if (user.password !== hashedOldPassword) {
        return callback({
          success: false,
          message: "Mật khẩu cũ không đúng",
          error: "",
        });
      }

      const hashedNewPassword = md5(newPassword);
      const queryUpdatePassword = "UPDATE users SET password = ? WHERE id = ?";
      db.query(queryUpdatePassword, [hashedNewPassword, userId], (err) => {
        if (err) {
          return callback({
            success: false,
            message: "Lỗi khi đổi mật khẩu",
            error: err.message,
          });
        }
        callback({
          success: true,
          message: "Đổi mật khẩu thành công",
          error: "",
        });
      });
    } catch (err) {
      callback({
        success: false,
        message: "Lỗi hệ thống",
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

  static async activateAccount(token, callback) {
    try {
      // Giải mã token để lấy email
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("a");
      console.log(decoded.email);
      const mail = decoded.email;

      // Truy vấn dữ liệu người dùng từ cơ sở dữ liệu
      const query = `SELECT * FROM users WHERE email = ?`;
      db.query(query, [mail], (err, result) => {
        if (err) {
          return callback({
            success: false,
            message: "Lỗi khi kiểm tra người dùng",
            error: err.message,
          });
        }

        console.log(result.length); // Kiểm tra số lượng bản ghi trả về
        if (result.length === 0) {
          return callback({
            success: false,
            message: "Email không tồn tại hoặc mã kích hoạt không hợp lệ.",
          });
        }

        // Cập nhật trạng thái tài khoản sau khi kiểm tra email hợp lệ
        const updateQuery = "UPDATE users SET status = 0 WHERE email = ?";
        db.query(updateQuery, [mail], (updateErr, updateResult) => {
          if (updateErr) {
            return callback({
              success: false,
              message: "Lỗi khi kích hoạt tài khoản",
              error: updateErr.message,
            });
          }

          callback({
            success: true,
            message: "Tài khoản đã được kích hoạt thành công.",
          });
        });
      });
    } catch (err) {
      callback({
        success: false,
        message: "Không thể kích hoạt tài khoản.",
        error: err.message,
      });
    }
  }

  static async reActive(email, callback) {
    try {
      // Kiểm tra email có tồn tại trong hệ thống không
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
          message: "Email không tồn tại trong hệ thống",
          error: "",
        });
      }

      const user = users[0];

      // Kiểm tra nếu tài khoản đã kích hoạt
      if (user.status === 0) {
        return callback({
          success: false,
          message: "Tài khoản đã được kích hoạt",
          error: "",
        });
      }

      // Tạo mã kích hoạt mới
      const activationCode = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });

      // Gửi mã kích hoạt qua email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Kích hoạt tài khoản của bạn",
        text: `Chào bạn,

        Bạn đã yêu cầu gửi lại mã kích hoạt tài khoản. Vui lòng sử dụng mã sau để kích hoạt tài khoản của bạn:
        ${activationCode}

        Lưu ý: Mã này chỉ có hiệu lực trong 15 phút.

        Trân trọng,
        Hệ thống hỗ trợ`,
      };

      await this.transporter.sendMail(mailOptions);

      callback({
        success: true,
        message: "Mã kích hoạt đã được gửi lại tới email của bạn",
        error: "",
      });
    } catch (err) {
      callback({
        success: false,
        message: "Lỗi khi xử lý yêu cầu gửi lại mã kích hoạt",
        error: err.message,
      });
    }
  }
}

module.exports = AuthModel;
