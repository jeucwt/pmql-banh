require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'tiembanh'
    });
    
    try {
        const [rows] = await pool.query("SELECT * FROM DonHang");
        console.log("Success, rows:", rows.length);
        console.log(rows);
    } catch (e) {
        console.error("Query Error:", e.message);
    }
    process.exit();
}
test();
