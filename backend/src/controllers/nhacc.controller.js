const pool = require("../config/db");

// GET /api/admin/nhacc
const getDanhSachNCC = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM NhaCungCap ORDER BY MaNCC DESC"
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

// POST /api/admin/nhacc
const themNCC = async (req, res) => {
    const { tenNCC, sdt, diaChi, email } = req.body;
    if (!tenNCC || !sdt || !diaChi) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc (tenNCC, sdt, diaChi)" });
    }
    try {
        const [result] = await pool.query(
            "INSERT INTO NhaCungCap (TenNCC, SDT, DiaChi, Email) VALUES (?, ?, ?, ?)",
            [tenNCC, sdt, diaChi, email || null]
        );
        res.status(201).json({ message: "Thêm nhà cung cấp thành công", maNCC: result.insertId });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

// PUT /api/admin/nhacc/:id
const capNhatNCC = async (req, res) => {
    const { id } = req.params;
    const { tenNCC, sdt, diaChi, email } = req.body;
    if (!tenNCC || !sdt || !diaChi) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    try {
        const [result] = await pool.query(
            "UPDATE NhaCungCap SET TenNCC=?, SDT=?, DiaChi=?, Email=? WHERE MaNCC=?",
            [tenNCC, sdt, diaChi, email || null, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
        res.json({ message: "Cập nhật thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

// DELETE /api/admin/nhacc/:id
const xoaNCC = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query(
            "DELETE FROM NhaCungCap WHERE MaNCC=?",
            [id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
        res.json({ message: "Xóa thành công" });
    } catch (err) {
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ message: "Không thể xóa: nhà cung cấp đang có phiếu nhập liên kết" });
        }
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

module.exports = { getDanhSachNCC, themNCC, capNhatNCC, xoaNCC };