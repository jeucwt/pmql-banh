// src/routes/admin.dashboard.route.js
const router = require('express').Router();
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { doanhThu, donHangTheoTrangThai, topSanPham, donHangChoSanXuat, taoLenhSanXuat, donHangDangLam, diDonHangSanXuat } = require('../controllers/dashboard.controller');

router.get('/doanhthu', verifyToken, requireRole('QuanLy'), doanhThu);
router.get('/donhang', verifyToken, requireRole('QuanLy'), donHangTheoTrangThai);
router.get('/sanpham', verifyToken, requireRole('QuanLy'), topSanPham);
router.get('/donhang-cho-sx', verifyToken, requireRole('QuanLy'), donHangChoSanXuat);
router.post('/tao-lenh-sx', verifyToken, requireRole('QuanLy'), taoLenhSanXuat);
router.get('/donhang-dang-lam', verifyToken, requireRole('QuanLy'), donHangDangLam);
router.post('/di-don-hang-sx', verifyToken, requireRole('QuanLy'), diDonHangSanXuat);

module.exports = router;