const jwt = require('jsonwebtoken');

// Xác thực token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: 'Chưa đăng nhập' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { MaTK, VaiTro }
    next();
  } catch {
    return res.status(403).json({ message: 'Token không hợp lệ' });
  }
};

// Kiểm tra quyền — dùng: requireRole('QuanLy') hoặc requireRole('QuanLy','NhanVienBanHang')
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Không có quyền thực hiện' });
  }
  next();
};

module.exports = { verifyToken, requireRole };