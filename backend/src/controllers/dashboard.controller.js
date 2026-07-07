// src/controllers/dashboard.controller.js
const pool = require('../config/db');

// GET /api/admin/dashboard/doanhthu?from=2026-01-01&to=2026-12-31
async function doanhThu(req, res) {
    const { from, to } = req.query;
    try {
        const [rows] = await pool.query(
            `SELECT DATE(h.NgayLap) AS ngay,
              COUNT(h.MaHD)   AS soHD,
              SUM(h.TongTien) AS tongTien
       FROM HoaDon h
       WHERE h.TrangThai = 'DaThanhToan'
         AND h.NgayLap BETWEEN ? AND ?
       GROUP BY DATE(h.NgayLap)
       ORDER BY ngay ASC`,
            [from, to]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi thống kê doanh thu', error: err.message });
    }
}

// GET /api/admin/dashboard/donhang
async function donHangTheoTrangThai(req, res) {
    try {
        const [rows] = await pool.query(
            `SELECT TrangThai, COUNT(*) AS soDon
       FROM DonHang
       GROUP BY TrangThai`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi thống kê đơn hàng', error: err.message });
    }
}

// GET /api/admin/dashboard/sanpham?from=...&to=...
async function topSanPham(req, res) {
    const { from, to } = req.query;
    try {
        const [rows] = await pool.query(
            `SELECT b.TenBanh, SUM(ct.SoLuong) AS tongBan
       FROM ChiTietDH ct
       JOIN Banh b ON ct.MaBanh = b.MaBanh
       JOIN DonHang d ON ct.MaDH = d.MaDH
       WHERE d.TrangThai != 'DaHuy'
         AND d.NgayDat BETWEEN ? AND ?
       GROUP BY b.MaBanh, b.TenBanh
       ORDER BY tongBan DESC
       LIMIT 5`,
            [from, to]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi thống kê sản phẩm', error: err.message });
    }
}

// GET /api/admin/dashboard/donhang-cho-sx
async function donHangChoSanXuat(req, res) {
    try {
        const [rows] = await pool.query(
            `SELECT dh.*, tk.HoTen AS TenKhachHang 
             FROM DonHang dh 
             LEFT JOIN TaiKhoan tk ON dh.MaKH = tk.MaTK 
             WHERE dh.TrangThai = 'ChoXacNhan' 
             ORDER BY dh.NgayDat ASC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi lấy đơn chờ sản xuất', error: err.message });
    }
}

// POST /api/admin/dashboard/tao-lenh-sx
async function taoLenhSanXuat(req, res) {
    const { danhSachMaDH } = req.body;
    if (!Array.isArray(danhSachMaDH) || danhSachMaDH.length === 0) {
        return res.status(400).json({ message: 'Danh sách mã đơn hàng không hợp lệ' });
    }
    
    try {
        await pool.query(
            `UPDATE DonHang SET TrangThai = 'DangLam' WHERE MaDH IN (?) AND TrangThai = 'ChoXacNhan'`,
            [danhSachMaDH]
        );
        res.json({ message: 'Cập nhật trạng thái thành Đang làm thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật trạng thái đơn hàng', error: err.message });
    }
}

module.exports = { doanhThu, donHangTheoTrangThai, topSanPham, donHangChoSanXuat, taoLenhSanXuat };