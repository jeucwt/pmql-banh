
const router = require('express').Router();
const { getProfile, updateProfile } = require('../controllers/kh.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');


router.get('/me', verifyToken, requireRole('KhachHang'), getProfile);
router.put('/me', verifyToken, requireRole('KhachHang'), updateProfile);

module.exports = router;
