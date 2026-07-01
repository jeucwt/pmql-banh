const router = require('express').Router();

const {
  taoDonHang,
  layDonHangCuaToi,
  layChiTietDonHang,
} = require('../controllers/donhang.controller');

const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, requireRole('KhachHang'), taoDonHang);
router.get('/me', verifyToken, requireRole('KhachHang'), layDonHangCuaToi);
router.get('/:id', verifyToken, requireRole('KhachHang'), layChiTietDonHang);

module.exports = router;