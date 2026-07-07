const router = require('express').Router();

const {
  taoDonHang,
  layDonHangCuaToi,
  layChiTietDonHang,
  capNhatVanChuyen,
  layDonHangDangXuLy,
} = require('../controllers/donhang.controller');

const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, requireRole('KhachHang'), taoDonHang);
router.get('/me', verifyToken, requireRole('KhachHang'), layDonHangCuaToi);
router.get('/dangxuly', verifyToken, requireRole('NhanVienBanHang', 'QuanLy'), layDonHangDangXuLy);
router.get('/:id', verifyToken, requireRole('KhachHang', 'QuanLy', 'NhanVienBanHang'), layChiTietDonHang);
router.patch('/:id/ship', verifyToken, requireRole('NhanVienBanHang', 'QuanLy'), capNhatVanChuyen);

module.exports = router;