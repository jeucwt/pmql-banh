const db = require('../config/db');

exports.getCongThuc = async (req, res) => {
  try {
    const maBanh = req.params.maBanh;
    const [rows] = await db.query(
      `SELECT ct.MaNL, ct.DinhLuong, ct.LichSuCT, nl.TenNL, nl.DonViTinh 
       FROM congthuc ct 
       JOIN nguyenlieu nl ON ct.MaNL = nl.MaNL 
       WHERE ct.MaBanh = ?`,
      [maBanh]
    );
    res.json(rows);
  } catch (err) {
    console.error('Lỗi khi lấy công thức:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateCongThuc = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const maBanh = req.params.maBanh;
    const { nguyenLieu, ghiChu } = req.body;
    
    const [oldRows] = await conn.query('SELECT MaNL, LichSuCT FROM congthuc WHERE MaBanh = ?', [maBanh]);
    const oldHistoryMap = {};
    oldRows.forEach(row => {
        oldHistoryMap[row.MaNL] = row.LichSuCT || '';
    });

    await conn.query('DELETE FROM congthuc WHERE MaBanh = ?', [maBanh]);

    if (nguyenLieu && nguyenLieu.length > 0) {
      const now = new Date();
      const timestamp = `[${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}]`;
      const logMsg = ghiChu || "Cập nhật công thức";
      const newLog = `${timestamp} ${logMsg}`;

      const values = nguyenLieu.map(item => {
        const oldLog = oldHistoryMap[item.maNL] ? (oldHistoryMap[item.maNL] + '\n') : '';
        const combinedLog = oldLog + newLog;
        return [maBanh, item.maNL, item.dinhLuong, combinedLog];
      });
      await conn.query('INSERT INTO congthuc (MaBanh, MaNL, DinhLuong, LichSuCT) VALUES ?', [values]);
    }

    await conn.commit();
    res.json({ message: 'Cập nhật công thức thành công' });
  } catch (err) {
    await conn.rollback();
    console.error('Lỗi khi cập nhật công thức:', err);
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
       return res.status(400).json({ message: 'Nguyên liệu hoặc bánh không tồn tại (Lỗi FK)' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  } finally {
    conn.release();
  }
};
