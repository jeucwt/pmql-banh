
const router = require('express').Router();
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const {
    layDanhSachHoaDon,
    layDonHangCho,
    layChiTietHoaDon,
    taoHoaDonTuDonHang,
    taoHoaDonTaiQuay,
} = require('../controllers/hoadon.controller');

const cashierRoles = ['NhanVienBanHang', 'QuanLy'];

router.get('/', verifyToken, requireRole(...cashierRoles), layDanhSachHoaDon);
router.get('/donhang-cho', verifyToken, requireRole(...cashierRoles), layDonHangCho);
router.get("/:id", verifyToken, requireRole(...cashierRoles), layChiTietHoaDon);
router.post('/', verifyToken, requireRole(...cashierRoles), taoHoaDonTuDonHang);
router.post('/tai-quay', verifyToken, requireRole(...cashierRoles), taoHoaDonTaiQuay);

module.exports = router;