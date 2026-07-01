
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


async function Register(req, res) {
  const { name, password, email, username, phone, address } = req.body;
  if (!name || !password || !email || !username) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
  }

  const hash = await bcrypt.hash(password, 10);
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      'INSERT INTO TaiKhoan (TenDangNhap, MatKhau, Email, VaiTro) VALUES (?, ?, ?, "KhachHang")',
      [name, hash, email]
    );
    const maTK = r.insertId;
    await conn.query(
      'INSERT INTO KhachHang (HoTen, SDT, DiaChi, MaTK) VALUES (?, ?, ?, ?)',
      [name, phone || null, address || null, maTK]
    );

    await conn.commit();
    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Tên đăng nhập hoặc email đã tồn tại' });
    throw err;
  } finally {
    conn.release();
  }
}

async function Login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
  }
  const [rows] = await pool.query(
    'SELECT * FROM TaiKhoan WHERE Email = ?', [email]
  );
  const tk = rows[0];
  if (!tk || !(await bcrypt.compare(password, tk.MatKhau)))
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

  // Lấy MaKH hoặc MaNV để dùng sau
  let maNguoiDung = null;
  if (tk.VaiTro === 'KhachHang') {
    const [kh] = await pool.query('SELECT MaKH FROM KhachHang WHERE MaTK = ?', [tk.MaTK]);
    maNguoiDung = kh[0]?.MaKH;
  } else {
    const [nv] = await pool.query('SELECT MaNV FROM NhanVien WHERE MaTK = ?', [tk.MaTK]);
    maNguoiDung = nv[0]?.MaNV;
  }

  const token = jwt.sign(
    { MaTK: tk.MaTK, role: tk.VaiTro, maNguoiDung },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    role: tk.VaiTro,
    maTK: tk.MaTK,
    maNguoiDung,
    tenDangNhap: tk.TenDangNhap
  });
}

module.exports = { Register, Login };