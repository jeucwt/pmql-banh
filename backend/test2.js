require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: 3307,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'tiembanh'
    });
    
    try {
        const [rows] = await pool.query("DESCRIBE KhachHang");
        console.log("KhachHang:", rows);
        const [rows2] = await pool.query("DESCRIBE NhanVien");
        console.log("NhanVien:", rows2);
    } catch (e) {
        console.error("Query Error:", e.message);
    }
    process.exit();
}
test();
