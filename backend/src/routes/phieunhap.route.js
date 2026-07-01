const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middlewares/auth.middleware");
const { getDanhSachPhieu, getChiTietPhieu, taoPhieuNhap } = require("../controllers/phieunhap.controller");

router.use(verifyToken, requireRole("QuanLy"));

router.get("/", getDanhSachPhieu);
router.get("/:id", getChiTietPhieu);
router.post("/", taoPhieuNhap);

module.exports = router;