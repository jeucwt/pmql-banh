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

module.exports = { doanhThu, donHangTheoTrangThai, topSanPham };