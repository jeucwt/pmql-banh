const pool = require('../config/db');

// GET /api/hoadon — danh sách hóa đơn (cashier xem)
async function layDanhSachHoaDon(req, res) {
    try {
        const [rows] = await pool.query(`
            SELECT
                h.MaHD, h.MaDH, h.MaNV, h.NgayLap, h.TongTien, h.TrangThai,
                n.TenNV AS TenNhanVien,
                k.HoTen AS TenKhachHang,
                tt.PhuongThuc
            FROM HoaDon h
            LEFT JOIN NhanVien n   ON h.MaNV = n.MaNV
            LEFT JOIN DonHang d    ON h.MaDH = d.MaDH
            LEFT JOIN KhachHang k  ON d.MaKH = k.MaKH
            LEFT JOIN ThanhToan tt ON h.MaHD = tt.MaHD
            ORDER BY h.NgayLap DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách hóa đơn', error: err.message });
    }
}

// Lấy chi tiết hóa đơn 
async function layChiTietHoaDon(req, res) {
    const { id } = req.params;
    try {
        const [[hoaDon]] = await pool.query(`
            SELECT
                h.MaHD, h.MaDH, h.NgayLap, h.TongTien, h.TrangThai,
                n.TenNV AS TenNhanVien,
                k.HoTen AS TenKhachHang, k.SDT, k.DiaChi,
                tt.PhuongThuc, tt.LoaiTT, tt.NgayTT
            FROM HoaDon h
            LEFT JOIN NhanVien n   ON h.MaNV = n.MaNV
            LEFT JOIN DonHang d    ON h.MaDH = d.MaDH
            LEFT JOIN KhachHang k  ON d.MaKH = k.MaKH
            LEFT JOIN ThanhToan tt ON h.MaHD = tt.MaHD
            WHERE h.MaHD = ?
        `, [id]);

        if (!hoaDon) return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });

        const [chiTiet] = await pool.query(`
            SELECT
                ct.MaBanh, ct.SoLuong, ct.DonGia,
                (ct.SoLuong * ct.DonGia) AS ThanhTien,
                b.TenBanh,
                s.KichThuoc
            FROM ChiTietDH ct
            JOIN Banh b     ON ct.MaBanh = b.MaBanh
            JOIN SizeBanh s ON ct.MaSize = s.MaSize AND ct.MaBanh = s.MaBanh
            WHERE ct.MaDH = ?
        `, [hoaDon.MaDH]);

        res.json({ ...hoaDon, chiTiet });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy chi tiết hóa đơn', error: err.message });
    }
}

// GET /api/hoadon/donhang-cho — đơn hàng ChoXacNhan (cashier duyệt)
async function layDonHangCho(req, res) {
    try {
        const [rows] = await pool.query(`
      SELECT d.*, k.HoTen AS TenKhachHang
      FROM DonHang d
      LEFT JOIN KhachHang k ON d.MaKH = k.MaKH
      WHERE d.TrangThai = 'ChoXacNhan'
      ORDER BY d.NgayDat ASC
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy đơn chờ', error: err.message });
    }
}

// POST /api/hoadon — tạo hóa đơn từ DonHang có sẵn (flow online)
async function taoHoaDonTuDonHang(req, res) {
    const maNV = req.user.maNguoiDung;
    const { maDH, phuongThucThanhToan } = req.body;
    // phuongThucThanhToan: 'TienMat' | 'ChuyenKhoan' | 'The'

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Lấy thông tin đơn hàng
        const [donHangRows] = await conn.query(
            'SELECT * FROM DonHang WHERE MaDH = ?',
            [maDH]
        );
        if (donHangRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        const donHang = donHangRows[0];
        if (donHang.TrangThai === 'DaHuy') {
            await conn.rollback();
            return res.status(400).json({ message: 'Đơn hàng đã bị hủy' });
        }

        // Tạo HoaDon
        const [hdResult] = await conn.query(
            `INSERT INTO HoaDon (MaNV, NgayLap, TongTien, TrangThai, MaDH)
       VALUES (1, NOW(), ?, 'DaThanhToan', ?)`,
            [donHang.TongTien, maDH]
        );

        // Cập nhật DonHang → HoanThanh
        await conn.query(
            "UPDATE DonHang SET TrangThai = 'HoanThanh' WHERE MaDH = ?",
            [maDH]
        );

        // Tạo ThanhToan
        await conn.query(
            `INSERT INTO ThanhToan (SoTien, PhuongThuc, LoaiTT, TrangThai, NgayTT, MaHD)
       VALUES (?, ?, 'ThanhToanToanBo', 'ThanhCong', NOW(), ?)`,
            [donHang.TongTien, phuongThucThanhToan, hdResult.insertId]
        );

        await conn.commit();
        res.status(201).json({
            message: 'Tạo hóa đơn thành công',
            maHD: hdResult.insertId,
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: 'Lỗi khi tạo hóa đơn', error: err.message });
    } finally {
        conn.release();
    }
}

// POST /api/hoadon/tai-quay — tạo HoaDon trực tiếp tại quán (không qua DonHang online)
async function taoHoaDonTaiQuay(req, res) {
    const maNV = req.user.maNguoiDung;
    const { items, phuongThucThanhToan } = req.body;
    // items: [{ maBanh, maSize, soLuong }]

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        let tongTien = 0;
        const chiTiet = [];

        for (const item of items) {
            const { maBanh, maSize, soLuong } = item;
            const [rows] = await conn.query(
                `SELECT s.GiaTien FROM SizeBanh s WHERE s.MaBanh = ? AND s.MaSize = ?`,
                [maBanh, maSize]
            );
            if (rows.length === 0) {
                await conn.rollback();
                return res.status(400).json({ message: `Không tìm thấy sản phẩm MaBanh=${maBanh}` });
            }
            const donGia = Number(rows[0].GiaTien);
            tongTien += donGia * soLuong;
            chiTiet.push({ maBanh, maSize, soLuong, donGia });
        }

        // Tạo DonHang tại quán (MaKH = NULL)
        const [dhResult] = await conn.query(
            `INSERT INTO DonHang (NgayDat, TongTien, TrangThai, maKH)
       VALUES (NOW(), ?, 'HoanThanh', 3)`,
            [tongTien]
        );
        const maDH = dhResult.insertId;

        // Insert ChiTietDH
        for (const item of chiTiet) {
            await conn.query(
                `INSERT INTO ChiTietDH (MaDH, MaBanh, MaSize, SoLuong, DonGia)
         VALUES (?, ?, ?, ?, ?)`,
                [maDH, item.maBanh, item.maSize, item.soLuong, item.donGia]
            );
        }

        // Tạo HoaDon
        const [hdResult] = await conn.query(
            `INSERT INTO HoaDon (MaNV, NgayLap, TongTien, TrangThai, MaDH)
       VALUES (?, NOW(), ?, 'DaThanhToan', ?)`,
            [maNV, tongTien, maDH]
        );

        // Tạo ThanhToan
        await conn.query(
            `INSERT INTO ThanhToan (SoTien, PhuongThuc, LoaiTT, TrangThai, NgayTT, MaHD)
       VALUES (?, ?, 'ThanhToanToanBo', 'ThanhCong', NOW(), ?)`,
            [tongTien, phuongThucThanhToan, hdResult.insertId]
        );

        await conn.commit();
        res.status(201).json({
            message: 'Tạo hóa đơn tại quầy thành công',
            maHD: hdResult.insertId,
            maDH,
            tongTien,
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: 'Lỗi khi tạo hóa đơn tại quầy', error: err.message });
    } finally {
        conn.release();
    }
}

module.exports = { layDanhSachHoaDon, layChiTietHoaDon, layDonHangCho, taoHoaDonTuDonHang, taoHoaDonTaiQuay };