const router = require('express').Router();
const { layDanhSachLoaiBanh } = require('../controllers/loaibanh.controller');

router.get('/', layDanhSachLoaiBanh);

module.exports = router;
