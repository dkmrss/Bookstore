require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const systemConfig = require("./src/app/configs/system");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/app/configs/swagger"); // Đường dẫn đến tệp swagger.js đã cấu hình
const cors = require("cors");
const app = express();
const path = require("path");

app.use(express.json());

app.options("*", cors());

app.use(cors({
  origin: "*", // Domain frontend được phép
  methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức HTTP được phép
  allowedHeaders: ["Content-Type", "Authorization"], // Các header được phép
}))

const pathConfig = require("./src/path");
global.__base = __dirname + "/src";
global.__path_app = __base + pathConfig.folder_app + "/";

global.__path_schemas = __path_app + pathConfig.folder_schemas + "";
global.__path_models = __path_app + pathConfig.folder_models + "";
global.__path_routers = __path_app + pathConfig.folder_routers + "";
global.__path_configs = __path_app + pathConfig.folder_configs + "";

// Sử dụng cấu hình cổng từ file system.js
app.locals.systemConfig = systemConfig;

// Gọi hàm để kết nối đến cơ sở dữ liệu
// Bạn có thể gọi hàm kết nối cơ sở dữ liệu ở đây (nếu cần)

// Sử dụng Swagger UI
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Sử dụng router từ các tệp trong thư mục routers
app.use("/api/v1/", require(__path_routers));

// Phục vụ các tệp tĩnh từ thư mục "assets"
app.use("/assets/avt", express.static(path.join(__dirname, "assets", "avt")));
app.use(
  "/assets/Banner",
  express.static(path.join(__dirname, "assets", "Banner"))
);
app.use(
  "/assets/Category",
  express.static(path.join(__dirname, "assets", "Category"))
);
app.use("/assets/News", express.static(path.join(__dirname, "assets", "News")));
app.use(
  "/assets/BookInfo",
  express.static(path.join(__dirname, "assets", "BookInfo"))
);
app.use(
  "/assets/ProductImage",
  express.static(path.join(__dirname, "assets", "ProductImage"))
);

// Xử lý lỗi 404 - Endpoint không tồn tại
app.use(function (req, res, next) {
  next(createError(404));
});

// Xử lý lỗi tổng quát
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Lỗi 400 cho các yêu cầu không hợp lệ
  if (err.status === 400) {
    res.status(400).json({ error: "Lỗi kết nối", message: err.message });
  } else if (err.status === 404) {
    res.status(404).json({ error: "Không tìm thấy", message: err.message });
  } else {
    // Các lỗi khác
    res.status(err.status || 500);
    res.json({
      error: err.message,
      message: "Có lỗi xảy ra vui lòng liên hệ với các bên liên quan",
    });
  }
});

// Sử dụng cổng từ cấu hình hệ thống
const port = app.locals.systemConfig.port || 3001;
app.listen(port, () => {
  console.log(`Ứng dụng đang chạy trên cổng ${port}`);
});

module.exports = app;
