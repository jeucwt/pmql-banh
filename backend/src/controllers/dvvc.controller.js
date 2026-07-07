const pool = require('../config/db');

async function layDanhSachDVVC(req, res) {
  try {
    const [rows] = await pool.query(`SELECT * FROM DonViVanChuyen`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách đơn vị vận chuyển',
      error: err.message,
    });
  }
}

module.exports = { layDanhSachDVVC };
