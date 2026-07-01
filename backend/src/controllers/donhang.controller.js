// src/controllers/donhang.controller.js
const pool = require('../config/db');

async function taoDonHang(req, res) {
  const maKH = req.user.maNguoiDung;
  const { items, phuongThucThanhToan = 'TienMat' } = req.body;

  if (!maKH) return res.status(401).json({ message: 'Tài khoản không hợp lệ' });
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ message: 'Đơn hàng phải có ít nhất 1 sản phẩm' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let tongTien = 0;
    const chiTietItems = [];
    let tatCaDuHang = true;

    for (const item of items) {
      const { maBanh, maSize, soLuong } = item;

      if (!maBanh || !maSize || !soLuong || soLuong <= 0) {
        await conn.rollback();
        return res.status(400).json({ message: 'Thông tin sản phẩm không hợp lệ' });
      }

      const [rows] = await conn.query(
        `SELECT b.MaBanh, b.SoLuong AS TonKho, s.MaSize, s.GiaTien
         FROM Banh b
         INNER JOIN SizeBanh s ON b.MaBanh = s.MaBanh
         WHERE b.MaBanh = ? AND s.MaSize = ? AND b.TrangThaiBanh = 'dang_ban'`,
        [maBanh, maSize]
      );

      if (rows.length === 0) {
        await conn.rollback();
        return res.status(400).json({ message: `Bánh hoặc size không hợp lệ: MaBanh=${maBanh}` });
      }

      const sanPham = rows[0];
      const donGia = Number(sanPham.GiaTien);
      tongTien += donGia * soLuong;

      if (Number(sanPham.TonKho) < soLuong) tatCaDuHang = false;

      chiTietItems.push({ maBanh, maSize, soLuong, donGia });
    }

    const trangThai = tatCaDuHang ? 'HoanThanh' : 'ChoXacNhan';

    const [dhResult] = await conn.query(
      'INSERT INTO DonHang (MaKH, NgayDat, TongTien, TrangThai) VALUES (?, NOW(), ?, ?)',
      [maKH, tongTien, trangThai]
    );
    const maDH = dhResult.insertId;

    // Insert ChiTietDH
    for (const item of chiTietItems) {
      await conn.query(
        'INSERT INTO ChiTietDH (MaDH, MaBanh, MaSize, SoLuong, DonGia) VALUES (?, ?, ?, ?, ?)',
        [maDH, item.maBanh, item.maSize, item.soLuong, item.donGia]
      );
    }

    // Nếu đủ hàng → tạo HoaDon + ThanhToan luôn
    let maHD = null;
    if (tatCaDuHang) {
      const [hdResult] = await conn.query(
        `INSERT INTO HoaDon (MaNV, NgayLap, TongTien, TrangThai, MaDH)
         VALUES (1, NOW(), ?, 'DaThanhToan', ?)`,
        [tongTien, maDH]
      );
      maHD = hdResult.insertId;

      await conn.query(
        `INSERT INTO ThanhToan (SoTien, PhuongThuc, LoaiTT, TrangThai, NgayTT, MaHD)
         VALUES (?, ?, 'ThanhToanToanBo', 'ThanhCong', NOW(), ?)`,
        [tongTien, phuongThucThanhToan, maHD]
      );

      for (const item of chiTietItems) {
        await conn.query(
          'UPDATE Banh SET SoLuong = SoLuong - ? WHERE MaBanh = ?',
          [item.soLuong, item.maBanh]
        );
      }
    }

    await conn.commit();

    res.status(201).json({
      message: tatCaDuHang ? 'Đặt hàng và thanh toán thành công' : 'Đặt hàng thành công, chờ xác nhận',
      donHang: { MaDH: maDH, TongTien: tongTien, TrangThai: trangThai },
      maHD,
      duHang: tatCaDuHang,
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng', error: err.message });
  } finally {
    conn.release();
  }
}

async function layDonHangCuaToi(req, res) {
  const maKH = req.user.maNguoiDung;

  try {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM DonHang
      WHERE MaKH = ?
      ORDER BY NgayDat DESC
      `,
      [maKH]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách đơn hàng',
      error: err.message,
    });
  }
}

async function layChiTietDonHang(req, res) {
  const maKH = req.user.maNguoiDung;
  const { id } = req.params;

  try {
    const [donHangRows] = await pool.query(
      `
      SELECT *
      FROM DonHang
      WHERE MaDH = ? AND MaKH = ?
      `,
      [id, maKH]
    );

    if (donHangRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const [chiTietRows] = await pool.query(
      `
      SELECT ct.*, b.TenBanh, s.KichThuoc
      FROM ChiTietDH ct
      INNER JOIN Banh b ON ct.MaBanh = b.MaBanh
      INNER JOIN SizeBanh s ON ct.MaSize = s.MaSize
      WHERE ct.MaDH = ?
      `,
      [id]
    );

    res.json({
      donHang: donHangRows[0],
      chiTiet: chiTietRows,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Lỗi khi lấy chi tiết đơn hàng',
      error: err.message,
    });
  }
}

module.exports = { taoDonHang, layDonHangCuaToi, layChiTietDonHang };