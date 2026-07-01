const pool = require('../config/db');

// Lay thon tin khach hang
async function getProfile(req, res) {
    try {
        const MaTK = req.user.MaTK;
        const [rows] = await pool.query(
            `SELECT tk.TenDangNhap, tk.Email, kh.HoTen, kh.SDT, kh.DiaChi
            FROM TaiKhoan tk
            LEFT JOIN KhachHang kh ON tk.MaTK = kh.MaTK
            WHERE tk.MaTK = ?`,
            [maTK]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản.' });
        }
        res.json(rows[0]);
    }
    catch (err) {
        console.error('Error in getProfile:', err);
        return res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}
//  Cap nhat thong tin ca nhan
async function updateProfile(req, res) {
    const { HoTen, SDT, DiaChi, Email } = req.body;
    const MaTK = req.user.MaTK;
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // Cap nhat tai khoan neu email thay doi
        if (Email) {
            await conn.query(
                `UPDATE TaiKhoan SET Email = ? WHERE MaTK = ?`,
                [Email, MaTK]
            );
        }

        // Cap nhat thong tin
        await conn.query(
            `UPDATE KhachHang SET HoTen = ?, SDT = ?, DiaChi = ? WHERE MaTK = ?`,
            [HoTen || null, SDT || null, DiaChi || null, MaTK]
        );
        await conn.commit();
        res.json({ message: 'Cập nhật thông tin thành công.' });
    }
    catch (err) {
        await conn.rollback();
        console.error('Error in updateProfile:', err);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
    finally {
        conn.release();
    }
}
module.exports = {
    getProfile,
    updateProfile
}
