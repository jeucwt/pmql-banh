const pool = require('../config/db');

// 1. GET /api/admin/sanxuat
async function getDanhSachPhieu(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        psx.MaPSX,
        psx.MaNV,
        psx.NgaySanXuat,
        psx.TrangThai,
        nv.TenNV,
        COUNT(ctpsx.MaBanh) AS SoDongChiTiet
      FROM PhieuSanXuat psx
      LEFT JOIN NhanVien nv ON psx.MaNV = nv.MaNV
      LEFT JOIN ChiTietPSX ctpsx ON psx.MaPSX = ctpsx.MaPSX
      GROUP BY psx.MaPSX, psx.MaNV, psx.NgaySanXuat, psx.TrangThai, nv.TenNV
      ORDER BY psx.NgaySanXuat DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error in getDanhSachPhieu:', err);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
}

// 2. GET /api/admin/sanxuat/:id
async function getChiTietPhieu(req, res) {
  const { id } = req.params;
  try {
    const [phieuRows] = await pool.query(`
      SELECT psx.MaPSX, psx.MaNV, psx.NgaySanXuat, psx.TrangThai, nv.TenNV
      FROM PhieuSanXuat psx
      LEFT JOIN NhanVien nv ON psx.MaNV = nv.MaNV
      WHERE psx.MaPSX = ?
    `, [id]);

    if (phieuRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu sản xuất' });
    }

    const [chiTietRows] = await pool.query(`
      SELECT ctpsx.MaPSX, ctpsx.MaBanh, ctpsx.SoLuong, ctpsx.SoLuongHoanThanh, b.TenBanh
      FROM ChiTietPSX ctpsx
      JOIN Banh b ON ctpsx.MaBanh = b.MaBanh
      WHERE ctpsx.MaPSX = ?
    `, [id]);

    const phieu = phieuRows[0];
    phieu.ChiTiet = chiTietRows;

    res.json(phieu);
  } catch (err) {
    console.error('Error in getChiTietPhieu:', err);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
}

// 3. POST /api/admin/sanxuat
async function taoPhieuSanXuat(req, res) {
  const { maNV, MaNV, danhSachBanh } = req.body;
  const targetMaNV = MaNV || maNV;

  if (!targetMaNV || !Array.isArray(danhSachBanh) || danhSachBanh.length === 0) {
    return res.status(400).json({ message: 'Vui lòng cung cấp mã nhân viên và danh sách bánh cần sản xuất' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [r] = await conn.query(
      'INSERT INTO PhieuSanXuat (MaNV) VALUES (?)',
      [targetMaNV]
    );
    const maPSX = r.insertId;

    for (const item of danhSachBanh) {
      const maBanh = item.MaBanh || item.maBanh;
      const soLuong = item.SoLuong || item.soLuong;
      if (!maBanh || !soLuong || soLuong <= 0) {
        throw new Error('Thông tin chi tiết bánh không hợp lệ');
      }
      await conn.query(
        'INSERT INTO ChiTietPSX (MaPSX, MaBanh, SoLuong) VALUES (?, ?, ?)',
        [maPSX, maBanh, soLuong]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Tạo phiếu sản xuất thành công', MaPSX: maPSX });
  } catch (err) {
    await conn.rollback();
    console.error('Error in taoPhieuSanXuat:', err);
    res.status(500).json({ message: err.message || 'Lỗi hệ thống' });
  } finally {
    conn.release();
  }
}

// 4. PATCH /api/admin/sanxuat/:id/trangthai
async function capNhatTrangThai(req, res) {
  const { id } = req.params;
  const { trangThai, TrangThai } = req.body;
  const targetTrangThai = TrangThai || trangThai;

  if (!targetTrangThai) {
    return res.status(400).json({ message: 'Vui lòng cung cấp trạng thái mới' });
  }

  try {
    const [rows] = await pool.query('SELECT TrangThai FROM PhieuSanXuat WHERE MaPSX = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu sản xuất' });
    }

    const currentStatus = rows[0].TrangThai;

    let isValidTransition = false;
    if (currentStatus === 'ChoSanXuat' && targetTrangThai === 'DangSanXuat') isValidTransition = true;
    else if (currentStatus === 'DangSanXuat' && targetTrangThai === 'HoanThanh') isValidTransition = true;
    else if (targetTrangThai === 'DaHuy' && (currentStatus === 'ChoSanXuat' || currentStatus === 'DangSanXuat')) isValidTransition = true;

    if (!isValidTransition) {
      return res.status(400).json({ message: 'Trạng thái chuyển đổi không hợp lệ' });
    }

    if (targetTrangThai === 'DangSanXuat') {
      // TenNL nằm ở bảng NguyenLieu, SoLuongTon nằm ở Kho — JOIN cả 2
      const [thieuRows] = await pool.query(`
        SELECT k.MaNL, nl.TenNL,
               SUM(ct.DinhLuong * ctpsx.SoLuong) AS CanDung,
               k.SoLuongTon
        FROM ChiTietPSX ctpsx
        JOIN CongThuc ct   ON ctpsx.MaBanh = ct.MaBanh
        JOIN Kho k         ON ct.MaNL = k.MaNL
        JOIN NguyenLieu nl ON k.MaNL = nl.MaNL
        WHERE ctpsx.MaPSX = ?
        GROUP BY k.MaNL, nl.TenNL, k.SoLuongTon
        HAVING CanDung > SoLuongTon
      `, [id]);

      if (thieuRows.length > 0) {
        return res.status(422).json({
          message: 'Không đủ nguyên liệu',
          thieu: thieuRows.map(row => ({
            TenNL: row.TenNL,
            CanDung: Number(row.CanDung),
            SoLuongTon: Number(row.SoLuongTon),
          })),
        });
      }

      await pool.query('UPDATE PhieuSanXuat SET TrangThai = ? WHERE MaPSX = ?', [targetTrangThai, id]);
      return res.json({ message: 'Chuyển sang trạng thái đang sản xuất thành công.' });

    } else if (targetTrangThai === 'HoanThanh') {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        await conn.query('UPDATE ChiTietPSX SET SoLuongHoanThanh = SoLuong WHERE MaPSX = ?', [id]);

        const [ctRows] = await conn.query('SELECT MaBanh, SoLuong FROM ChiTietPSX WHERE MaPSX = ?', [id]);
        for (const item of ctRows) {
          await conn.query('UPDATE Banh SET SoLuong = SoLuong + ? WHERE MaBanh = ?', [item.SoLuong, item.MaBanh]);
        }

        const [nguyenLieuRows] = await conn.query(`
          SELECT ct.MaNL, SUM(ct.DinhLuong * ctpsx.SoLuong) AS CanDung
          FROM ChiTietPSX ctpsx
          JOIN CongThuc ct ON ctpsx.MaBanh = ct.MaBanh
          WHERE ctpsx.MaPSX = ?
          GROUP BY ct.MaNL
        `, [id]);

        for (const nl of nguyenLieuRows) {
          await conn.query('UPDATE Kho SET SoLuongTon = SoLuongTon - ? WHERE MaNL = ?', [nl.CanDung, nl.MaNL]);
        }

        await conn.query('UPDATE PhieuSanXuat SET TrangThai = ? WHERE MaPSX = ?', [targetTrangThai, id]);

        await conn.commit();
        res.json({ message: 'Hoàn thành phiếu sản xuất thành công.' });
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }

    } else {
      // DaHuy
      await pool.query('UPDATE PhieuSanXuat SET TrangThai = ? WHERE MaPSX = ?', [targetTrangThai, id]);
      res.json({ message: 'Hủy phiếu sản xuất thành công.' });
    }

  } catch (err) {
    console.error('Error in capNhatTrangThai:', err);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
}

// 5. DELETE /api/admin/sanxuat/:id
async function xoaPhieuSanXuat(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT TrangThai FROM PhieuSanXuat WHERE MaPSX = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu sản xuất' });
    }

    if (rows[0].TrangThai !== 'ChoSanXuat') {
      return res.status(400).json({ message: 'Chỉ được xóa phiếu ở trạng thái Chờ sản xuất' });
    }

    await pool.query("UPDATE PhieuSanXuat SET TrangThai = 'DaHuy' WHERE MaPSX = ?", [id]);
    res.json({ message: 'Xóa phiếu sản xuất thành công (Đã chuyển sang trạng thái Hủy).' });
  } catch (err) {
    console.error('Error in xoaPhieuSanXuat:', err);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
}

module.exports = {
  getDanhSachPhieu,
  getChiTietPhieu,
  taoPhieuSanXuat,
  capNhatTrangThai,
  xoaPhieuSanXuat,
};