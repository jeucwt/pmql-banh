const pool = require('./backend/src/config/db');

async function run() {
  try {
    await pool.query("ALTER TABLE DonHang ADD COLUMN MaVanDon VARCHAR(50) NULL");
    console.log("Thêm cột MaVanDon thành công!");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Cột MaVanDon đã tồn tại.");
    } else {
      console.error(err);
    }
  } finally {
    process.exit(0);
  }
}
run();
