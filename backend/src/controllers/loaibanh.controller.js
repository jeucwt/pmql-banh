const pool = require('../config/db');

async function layDanhSachLoaiBanh(req, res) {
    try {
        const [rows] = await pool.query('SELECT * FROM LoaiBanh');
        res.json(rows);
    } catch (err) {
        res.status(500).json({
            message: "Lỗi khi lấy danh sách loại bánh",
            error: err.message,
        });
    }
}

module.exports = { layDanhSachLoaiBanh };
