const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const {
  layDanhSachBanh,
  layChiTietBanh,
  themBanh,
  capNhatBanh,
  xoaBanh,
  uploadAnhBanh
} = require('../controllers/banh.controller');

// Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banh-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.post('/upload', verifyToken, requireRole('QuanLy'), upload.single('hinhAnh'), uploadAnhBanh);
router.get('/', verifyToken, requireRole('QuanLy'), layDanhSachBanh);
router.get('/:id', verifyToken, requireRole('QuanLy'), layChiTietBanh);
router.post('/', verifyToken, requireRole('QuanLy'), themBanh);
router.put('/:id', verifyToken, requireRole('QuanLy'), capNhatBanh);
router.delete('/:id', verifyToken, requireRole('QuanLy'), xoaBanh);

module.exports = router;