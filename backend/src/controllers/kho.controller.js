const pool = require('../config/db');

// GET /api/admin/kho — JOIN NguyenLieu + Kho, kèm cảnh báo tồn thấp
async function getDanhSachNguyenLieu(req, res) {
    try {
        const [rows] = await pool.query(`
      SELECT 
        nl.MaNL, nl.TenNL, nl.GiaNhap, nl.SoLuongDonVi, nl.DonViTinh,
        k.SoLuongTon, k.SoLuongToiThieu,
        (k.SoLuongTon < k.SoLuongToiThieu) AS CanhBao
      FROM NguyenLieu nl
      JOIN Kho k ON nl.MaNL = k.MaNL
      ORDER BY nl.TenNL ASC
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách nguyên liệu', error: err.message });
    }
}

// POST /api/admin/kho — tạo NguyenLieu + Kho trong 1 transaction
async function themNguyenLieu(req, res) {
    const { tenNL, giaNhap, soLuongDonVi, donViTinh, soLuongTon, soLuongToiThieu } = req.body;
    if (!tenNL || soLuongTon == null || soLuongToiThieu == null) {
        return res.status(400).json({ message: 'Thiếu thông tin nguyên liệu' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [nlResult] = await conn.query(
            'INSERT INTO NguyenLieu (TenNL, GiaNhap, SoLuongDonVi, DonViTinh) VALUES (?, ?, ?, ?)',
            [tenNL, giaNhap ?? null, soLuongDonVi ?? null, donViTinh ?? null]
        );
        const maNL = nlResult.insertId;

        await conn.query(
            'INSERT INTO Kho (MaNL, SoLuongTon, SoLuongToiThieu) VALUES (?, ?, ?)',
            [maNL, soLuongTon, soLuongToiThieu]
        );

        await conn.commit();
        res.status(201).json({ message: 'Thêm nguyên liệu thành công', maNL });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: 'Lỗi khi thêm nguyên liệu', error: err.message });
    } finally {
        conn.release();
    }
}

// PUT /api/admin/kho/:id — cập nhật cả NguyenLieu + Kho
async function capNhatNguyenLieu(req, res) {
    const { id } = req.params;
    const { tenNL, giaNhap, soLuongDonVi, donViTinh, soLuongTon, soLuongToiThieu } = req.body;
    if (!tenNL || soLuongTon == null || soLuongToiThieu == null) {
        return res.status(400).json({ message: 'Thiếu thông tin nguyên liệu' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [nlResult] = await conn.query(
            'UPDATE NguyenLieu SET TenNL = ?, GiaNhap = ?, SoLuongDonVi = ?, DonViTinh = ? WHERE MaNL = ?',
            [tenNL, giaNhap ?? null, soLuongDonVi ?? null, donViTinh ?? null, id]
        );
        if (nlResult.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ message: 'Không tìm thấy nguyên liệu' });
        }

        await conn.query(
            'UPDATE Kho SET SoLuongTon = ?, SoLuongToiThieu = ? WHERE MaNL = ?',
            [soLuongTon, soLuongToiThieu, id]
        );

        await conn.commit();
        res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: 'Lỗi khi cập nhật nguyên liệu', error: err.message });
    } finally {
        conn.release();
    }
}

// DELETE /api/admin/kho/:id — xóa Kho trước (FK con) rồi NguyenLieu
async function xoaNguyenLieu(req, res) {
    const { id } = req.params;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query('DELETE FROM Kho WHERE MaNL = ?', [id]);
        const [nlResult] = await conn.query('DELETE FROM NguyenLieu WHERE MaNL = ?', [id]);

        if (nlResult.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ message: 'Không tìm thấy nguyên liệu' });
        }

        await conn.commit();
        res.json({ message: 'Xóa thành công' });
    } catch (err) {
        await conn.rollback();
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Nguyên liệu đang được dùng trong công thức, không thể xóa' });
        }
        res.status(500).json({ message: 'Lỗi khi xóa nguyên liệu', error: err.message });
    } finally {
        conn.release();
    }
}

module.exports = { getDanhSachNguyenLieu, themNguyenLieu, capNhatNguyenLieu, xoaNguyenLieu };