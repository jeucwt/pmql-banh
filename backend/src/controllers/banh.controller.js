// src/controllers/banh.controller.js
const pool = require('../config/db');

// Get api/banh
async function layDanhSachBanhDangBan(req, res) {
    try{
        const [rows] = await pool.query(`
            SELECT b.*, l.TenLoai,
            JSON_ARRAYAGG(JSON_OBJECT('MaSize', s.MaSize, 'KichThuoc', s.KichThuoc, 'GiaTien', s.GiaTien)) AS sizes
            FROM Banh b
            LEFT JOIN LoaiBanh l ON b.MaLoai = l.MaLoai
            LEFT JOIN SizeBanh s ON b.MaBanh = s.MaBanh
            WHERE b.TrangThaiBanh = 'dang_ban'
            GROUP BY b.MaBanh
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({
            message: "Lỗi khi lấy danh sách",
            error: err.message,
        });
    }
}

// Get api/adim/banh
async function layDanhSachBanh(req, res) {
    try{
        const [rows] = await pool.query(`
            SELECT b.*, l.TenLoai,
            JSON_ARRAYAGG(JSON_OBJECT('MaSize', s.MaSize, 'KichThuoc', s.KichThuoc, 'GiaTien', s.GiaTien)) AS sizes
            FROM Banh b
            LEFT JOIN LoaiBanh l ON b.MaLoai = l.MaLoai
            LEFT JOIN SizeBanh s ON b.MaBanh = s.MaBanh
            GROUP BY b.MaBanh
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({
            message: "Lỗi khi lấy danh sách",
            error: err.message,
        });
    }
}


// GET /api/banh/:id
async function layChiTietBanhDangBan(req, res) {
    try {
        const { id } = req.params;

        const [row] = await pool.query(
            `
            SELECT b.*, l.TenLoai,
            JSON_ARRAYAGG(JSON_OBJECT('MaSize', s.MaSize, 'KichThuoc', s.KichThuoc, 'GiaTien', s.GiaTien)) AS sizes
            FROM Banh b
            LEFT JOIN LoaiBanh l ON b.MaLoai = l.MaLoai
            LEFT JOIN SizeBanh s ON b.MaBanh = s.MaBanh
            WHERE b.MaBanh = ? AND b.TrangThaiBanh = 'dang_ban'
            GROUP BY b.MaBanh, l.TenLoai
            `,
            [id]
        );

        if (row.length === 0){
            return res.status(404).json({message: "Không tìm thấy bánh !"})
        }

        res.json(row[0]);
    } catch (err) {
        res.status(500).json({
            message: "Lỗi khi lấy chi tiết bánh",
            error: err.message,
        });
    }
}

// GET /api/adim/banh/:id
async function layChiTietBanh(req, res) {
    try {
        const { id } = req.params;

        const [row] = await pool.query(
            `
            SELECT b.*, l.TenLoai,
            JSON_ARRAYAGG(JSON_OBJECT('MaSize', s.MaSize, 'KichThuoc', s.KichThuoc, 'GiaTien', s.GiaTien)) AS sizes
            FROM Banh b
            LEFT JOIN LoaiBanh l ON b.MaLoai = l.MaLoai
            LEFT JOIN SizeBanh s ON b.MaBanh = s.MaBanh
            WHERE b.MaBanh = ? 
            GROUP BY b.MaBanh, l.TenLoai
            `,
            [id]
        );

        if (row.length === 0){
            return res.status(404).json({message: "Không tìm thấy bánh !"})
        }

        res.json(row[0]);
    } catch (err) {
        res.status(500).json({
            message: "Lỗi khi lấy chi tiết bánh",
            error: err.message,
        });
    }
}


// POST /api/adim/banh
async function themBanh(req, res) {
    const { tenBanh, moTa, maLoai, trangThaiBanh, sizes, hinhAnh } = req.body;
    // sizes: [{ kichThuoc, giaTien }]

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [r] = await conn.query(
            'INSERT INTO Banh (TenBanh, MoTa, MaLoai, TrangThaiBanh, HinhAnh) VALUES (?, ?, ?, ?, ?)',
            [tenBanh, moTa, maLoai, trangThaiBanh, hinhAnh]
        );
        const maBanh = r.insertId;
        if (sizes?.length) {
            for (const s of sizes) {
                await conn.query(
                    'INSERT INTO SizeBanh (KichThuoc, GiaTien, MaBanh) VALUES (?, ?, ?)',
                    [s.kichThuoc, s.giaTien, maBanh]
                );
            }
        }
        await conn.commit();
        res.status(201).json({ message: "Thêm bánh thành công ",maBanh });
    } catch (err) {
        console.error(err);
        await conn.rollback();
        res.status(500).json({
            message: "Lỗi khi thêm bánh",
            error: err.message,
            
        });
    } finally {
        conn.release();
    }
    
}

// PUT /api/admin/banh/:id
async function capNhatBanh(req, res) {
    const { id } = req.params;
    const { tenBanh, moTa, maLoai, trangThaiBanh, sizes, hinhAnh } = req.body;
    const conn = await pool.getConnection();

    try{
        await conn.beginTransaction();

        const [r] = await conn.query(
            `
            UPDATE Banh
            SET TenBanh = ?, MoTa = ?, MaLoai = ?, TrangThaiBanh = ?, HinhAnh = ? 
            Where MaBanh = ?
            `,
            [tenBanh, moTa, maLoai, trangThaiBanh, hinhAnh, id]
        );
        if (r.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({
                message: "Không tìm thấy bánh"
            });
        }
        if (Array.isArray(sizes)) {
            await conn.query('DELETE FROM SizeBanh WHERE MaBanh = ?', [id]);

            for (const size of sizes) {
                await conn.query(
                `
                INSERT INTO SizeBanh (KichThuoc, GiaTien, MaBanh)
                VALUES (?, ?, ?)
                `,
                [size.kichThuoc, size.giaTien, id]
                );
            }
            }

            await conn.commit();

            res.json({
            message: 'Cập nhật bánh thành công',
            });
        } catch (err) {
            await conn.rollback();

            res.status(500).json({
            message: 'Lỗi khi cập nhật bánh',
            error: err.message,
            });
        } finally {
            conn.release();
        }
}

// DELETE /api/admin/banh/:id
// xóa nhưng trên các hóa đơn, đơn hàng cũ vẫn còn
async function xoaBanh(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `
      UPDATE Banh
      SET TrangThaiBanh = ?
      WHERE MaBanh = ?
      `,
      ['ngung_ban', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bánh' });
    }

    res.json({
      message: 'Đã ngừng bán bánh',
    });
  } catch (err) {
    res.status(500).json({
      message: 'Lỗi khi xóa bánh',
      error: err.message,
    });
  }
}

async function uploadAnhBanh(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Không có file được tải lên' });
        }
        res.json({ url: `/uploads/${req.file.filename}` });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi tải ảnh lên', error: err.message });
    }
}

module.exports = { layDanhSachBanhDangBan, layChiTietBanhDangBan, layDanhSachBanh, layChiTietBanh, themBanh, capNhatBanh, xoaBanh, uploadAnhBanh };