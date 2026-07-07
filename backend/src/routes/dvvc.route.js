const router = require('express').Router();
const { layDanhSachDVVC } = require('../controllers/dvvc.controller');

router.get('/', layDanhSachDVVC);

module.exports = router;
