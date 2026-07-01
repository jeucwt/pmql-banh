const router = require('express').Router();
const {
  getDanhSachPhieu,
  getChiTietPhieu,
  taoPhieuSanXuat,
  capNhatTrangThai,
  xoaPhieuSanXuat
} = require('../controllers/sanxuat.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, requireRole('QuanLy'), getDanhSachPhieu);
router.get('/:id', verifyToken, requireRole('QuanLy'), getChiTietPhieu);
router.post('/', verifyToken, requireRole('QuanLy'), taoPhieuSanXuat);
router.patch('/:id/trangthai', verifyToken, requireRole('QuanLy'), capNhatTrangThai);
router.delete('/:id', verifyToken, requireRole('QuanLy'), xoaPhieuSanXuat);

module.exports = router;
