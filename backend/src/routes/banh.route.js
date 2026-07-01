const router = require('express').Router();
const {
  layDanhSachBanhDangBan,
  layChiTietBanhDangBan,
} = require('../controllers/banh.controller');

router.get('/', layDanhSachBanhDangBan);
router.get('/:id', layChiTietBanhDangBan);

module.exports = router;