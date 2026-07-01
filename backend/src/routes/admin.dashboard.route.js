// src/routes/admin.dashboard.route.js
const router = require('express').Router();
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { doanhThu, donHangTheoTrangThai, topSanPham } = require('../controllers/dashboard.controller');

router.get('/doanhthu', verifyToken, requireRole('QuanLy'), doanhThu);
router.get('/donhang', verifyToken, requireRole('QuanLy'), donHangTheoTrangThai);
router.get('/sanpham', verifyToken, requireRole('QuanLy'), topSanPham);

module.exports = router;