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
            `SELECT dh.*, kh.HoTen AS TenKhachHang 
             FROM DonHang dh 
             LEFT JOIN KhachHang kh ON dh.MaKH = kh.MaTK 
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

// GET /api/admin/dashboard/donhang-dang-lam
async function donHangDangLam(req, res) {
    try {
        const [orders] = await pool.query(
            `SELECT dh.*, kh.HoTen AS TenKhachHang 
             FROM DonHang dh 
             LEFT JOIN KhachHang kh ON dh.MaKH = kh.MaTK 
             WHERE dh.TrangThai = 'DangLam' 
             ORDER BY dh.NgayDat ASC`
        );

        for (let order of orders) {
            const [details] = await pool.query(
                `SELECT ct.MaBanh, ct.MaSize, ct.SoLuong, b.SoLuong as TonKho
                 FROM ChiTietDH ct
                 JOIN Banh b ON ct.MaBanh = b.MaBanh
                 WHERE ct.MaDH = ?`,
                [order.MaDH]
            );
            let isReady = true;
            for (let detail of details) {
                if (detail.TonKho < detail.SoLuong) {
                    isReady = false;
                    break;
                }
            }
            order.isReady = isReady;
        }
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi lấy đơn đang sản xuất', error: err.message });
    }
}

// POST /api/admin/dashboard/di-don-hang-sx
async function diDonHangSanXuat(req, res) {
    const { danhSachMaDH } = req.body;
    if (!Array.isArray(danhSachMaDH) || danhSachMaDH.length === 0) {
        return res.status(400).json({ message: 'Danh sách mã đơn hàng không hợp lệ' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        for (const maDH of danhSachMaDH) {
            const [orderRows] = await conn.query('SELECT TrangThai, TongTien FROM DonHang WHERE MaDH = ?', [maDH]);
            if (orderRows.length === 0 || orderRows[0].TrangThai !== 'DangLam') continue;

            const tongTien = orderRows[0].TongTien;

            const [details] = await conn.query(
                `SELECT ct.MaBanh, ct.MaSize, ct.SoLuong, b.SoLuong as TonKho
                 FROM ChiTietDH ct
                 JOIN Banh b ON ct.MaBanh = b.MaBanh
                 WHERE ct.MaDH = ?`,
                [maDH]
            );

            let isReady = true;
            for (let detail of details) {
                if (detail.TonKho < detail.SoLuong) {
                    isReady = false;
                    break;
                }
            }

            if (!isReady) {
                throw new Error(`Đơn hàng #${maDH} chưa đủ bánh trong kho.`);
            }

            for (let detail of details) {
                await conn.query(
                    'UPDATE Banh SET SoLuong = SoLuong - ? WHERE MaBanh = ?',
                    [detail.SoLuong, detail.MaBanh]
                );
            }

            const [hdResult] = await conn.query(
                `INSERT INTO HoaDon (MaNV, NgayLap, TongTien, TrangThai, MaDH)
                 VALUES (1, NOW(), ?, 'DaThanhToan', ?)`,
                [tongTien, maDH]
            );
            const maHD = hdResult.insertId;

            await conn.query(
                `INSERT INTO ThanhToan (SoTien, PhuongThuc, LoaiTT, TrangThai, NgayTT, MaHD)
                 VALUES (?, 'TienMat', 'ThanhToanToanBo', 'ThanhCong', NOW(), ?)`,
                [tongTien, maHD]
            );

            await conn.query(
                `UPDATE DonHang SET TrangThai = 'DangXuLy' WHERE MaDH = ?`,
                [maDH]
            );
        }

        await conn.commit();
        res.json({ message: 'Đã đi đơn hàng thành công' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: 'Lỗi khi đi đơn hàng', error: err.message });
    } finally {
        conn.release();
    }
}

module.exports = { doanhThu, donHangTheoTrangThai, topSanPham, donHangChoSanXuat, taoLenhSanXuat, donHangDangLam, diDonHangSanXuat };