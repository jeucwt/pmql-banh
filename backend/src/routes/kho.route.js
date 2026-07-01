const router = require('express').Router();
const {
    getDanhSachNguyenLieu,
    themNguyenLieu,
    capNhatNguyenLieu,
    xoaNguyenLieu,
} = require('../controllers/kho.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, requireRole('QuanLy'), getDanhSachNguyenLieu);
router.post('/', verifyToken, requireRole('QuanLy'), themNguyenLieu);
router.put('/:id', verifyToken, requireRole('QuanLy'), capNhatNguyenLieu);
router.delete('/:id', verifyToken, requireRole('QuanLy'), xoaNguyenLieu);

module.exports = router;