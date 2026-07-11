const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const path = require('path');

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Phục vụ các file tĩnh trong thư mục public
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Bakery API đang chạy!' });
});

// Routes 
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/banh', require('./routes/banh.route'));
app.use('/api/admin/banh', require('./routes/admin.banh.route'));
app.use('/api/donhang', require('./routes/donhang.route'));
app.use('/api/dvvc', require('./routes/dvvc.route'));
app.use('/api/kh', require('./routes/kh.route'));
app.use('/api/admin/sanxuat', require('./routes/sanxuat.route'));
app.use('/api/admin/dashboard', require('./routes/admin.dashboard.route'));
app.use('/api/hoadon', require('./routes/hoadon.route'));
app.use('/api/admin/kho', require('./routes/kho.route'));
app.use('/api/admin/phieunhap', require('./routes/phieunhap.route'));
app.use('/api/admin/nhacc', require('./routes/nhacc.route'));
app.use('/api/admin/congthuc', require('./routes/congthuc.route'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});