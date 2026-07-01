const pool = require("../config/db");

// GET /api/admin/phieunhap — list, JOIN NhaCungCap + NhanVien
const getDanhSachPhieu = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT
        pn.MaPN, pn.NgayNhap, pn.TongTien,
        ncc.TenNCC, ncc.MaNCC,
        nv.TenNV AS TenNhanVien,
        COUNT(ct.MaNL) AS SoDongNguyenLieu
      FROM PhieuNhap pn
      JOIN NhaCungCap ncc ON pn.MaNCC = ncc.MaNCC
      JOIN NhanVien nv ON pn.MaNV = nv.MaNV
      LEFT JOIN ChiTietPN ct ON pn.MaPN = ct.MaPN
      GROUP BY pn.MaPN, pn.NgayNhap, pn.TongTien, ncc.TenNCC, ncc.MaNCC, nv.TenNV
      ORDER BY pn.MaPN DESC
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

// GET /api/admin/phieunhap/:id — chi tiết, JOIN ChiTietPN + NguyenLieu
const getChiTietPhieu = async (req, res) => {
    const { id } = req.params;
    try {
        const [[phieu]] = await pool.query(`
      SELECT
        pn.MaPN, pn.NgayNhap, pn.TongTien,
        ncc.TenNCC, ncc.SDT AS SDT_NCC,
        nv.TenNV AS TenNhanVien
      FROM PhieuNhap pn
      JOIN NhaCungCap ncc ON pn.MaNCC = ncc.MaNCC
      JOIN NhanVien nv ON pn.MaNV = nv.MaNV
      WHERE pn.MaPN = ?
    `, [id]);

        if (!phieu) return res.status(404).json({ message: "Không tìm thấy phiếu nhập" });

        const [chiTiet] = await pool.query(`
      SELECT
        ct.MaNL, ct.SoLuong, ct.DonGia,
        (ct.SoLuong * ct.DonGia) AS ThanhTien,
        nl.TenNL, nl.DonViTinh
      FROM ChiTietPN ct
      JOIN NguyenLieu nl ON ct.MaNL = nl.MaNL
      WHERE ct.MaPN = ?
    `, [id]);

        res.json({ ...phieu, chiTiet });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

// POST /api/admin/phieunhap — tạo phiếu + cập nhật tồn kho ngay
// Body: { maNCC, danhSachNguyenLieu: [{ maNL, soLuong, donGia }] }
const taoPhieuNhap = async (req, res) => {
    const { maNCC, danhSachNguyenLieu } = req.body;
    const maNV = 1; // hardcode như pattern hiện tại

    if (!maNCC || !danhSachNguyenLieu || danhSachNguyenLieu.length === 0) {
        return res.status(400).json({ message: "Thiếu thông tin: maNCC và danhSachNguyenLieu (ít nhất 1 dòng)" });
    }

    const tongTien = danhSachNguyenLieu.reduce(
        (sum, item) => sum + item.soLuong * item.donGia,
        0
    );

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Tạo PhieuNhap
        const [pnResult] = await conn.query(
            "INSERT INTO PhieuNhap (MaNV, MaNCC, TongTien) VALUES (?, ?, ?)",
            [maNV, maNCC, tongTien]
        );
        const maPN = pnResult.insertId;

        // 2. Insert ChiTietPN + cập nhật Kho trong 1 vòng lặp
        for (const item of danhSachNguyenLieu) {
            const { maNL, soLuong, donGia } = item;

            await conn.query(
                "INSERT INTO ChiTietPN (MaPN, MaNL, SoLuong, DonGia) VALUES (?, ?, ?, ?)",
                [maPN, maNL, soLuong, donGia]
            );

            // Cộng tồn kho — Kho có thể chưa có row nếu nguyên liệu mới thêm
            const [khoRows] = await conn.query(
                "SELECT MaNL FROM Kho WHERE MaNL = ?",
                [maNL]
            );
            if (khoRows.length > 0) {
                await conn.query(
                    "UPDATE Kho SET SoLuongTon = SoLuongTon + ? WHERE MaNL = ?",
                    [soLuong, maNL]
                );
            } else {
                await conn.query(
                    "INSERT INTO Kho (MaNL, SoLuongTon, SoLuongToiThieu) VALUES (?, ?, 0)",
                    [maNL, soLuong]
                );
            }
        }

        await conn.commit();
        res.status(201).json({ message: "Tạo phiếu nhập thành công", maPN });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: "Lỗi server", error: err.message });
    } finally {
        conn.release();
    }
};

module.exports = { getDanhSachPhieu, getChiTietPhieu, taoPhieuNhap };