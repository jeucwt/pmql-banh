const router = require('express').Router();
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const {
  layDanhSachBanh,
  layChiTietBanh,
  themBanh,
  capNhatBanh,
  xoaBanh,
} = require('../controllers/banh.controller');

router.get('/', verifyToken, requireRole('QuanLy'), layDanhSachBanh);
router.get('/:id', verifyToken, requireRole('QuanLy'), layChiTietBanh);
router.post('/', verifyToken, requireRole('QuanLy'), themBanh);
router.put('/:id', verifyToken, requireRole('QuanLy'), capNhatBanh);
router.delete('/:id', verifyToken, requireRole('QuanLy'), xoaBanh);

module.exports = router;