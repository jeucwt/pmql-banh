const express = require('express');
const router = express.Router();
const congThucController = require('../controllers/congthuc.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.get('/:maBanh', verifyToken, requireRole('QuanLy'), congThucController.getCongThuc);
router.put('/:maBanh', verifyToken, requireRole('QuanLy'), congThucController.updateCongThuc);

module.exports = router;
