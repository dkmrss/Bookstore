const express = require("express");
const AuthRouter = require("./AuthRouter");
const UsersRouter = require("./UsersRouter"); // Đường dẫn đến UsersRouter
const CartRouter = require("./CartRouter");
const CategoryRouter = require("./CategoryRouter");
const BannerRouter = require("./BannerRouter");
const NewRouter = require("./NewRouter");
const BookInfoRouter = require("./BookInfoRouter");
const CommentRouter = require("./UserCommentRouter");
const RatingRouter = require("./RatingRouter");
const OrderRouter = require("./OrderRouter");
const ProductsRouter = require("./ProductsRouter");
const SearchKeyRouter = require("./SearchKeyRouter");
const StatisticsRouter = require("./StatisticsRouter");
const router = express.Router();

// Route cho các ví dụ

// Route cho đăng nhập
router.use("/auth", AuthRouter);

// Route cho người dùng
router.use("/users", UsersRouter);

// Route cho giỏ hàng
router.use("/cart", CartRouter);

// // Route cho lấy sản phẩm
router.use('/products', ProductsRouter);

// Route cho danh mục
router.use("/category", CategoryRouter);

// Route cho banner
router.use("/banner", BannerRouter);

// Route cho bài viết
router.use("/news", NewRouter);

// Route cho ảnh thêm sách
router.use("/bookInfo", BookInfoRouter);

// Route cho bình luận
router.use("/user-comment", CommentRouter);

// Route cho đánh giá
router.use("/rating", RatingRouter);

// Route cho đơn hàng
router.use("/orders", OrderRouter);

// Router liên quan từ khóa tìm kiếm
router.use("/search", SearchKeyRouter)

// Router tính toán
router.use("/statistics", StatisticsRouter)

module.exports = router;
