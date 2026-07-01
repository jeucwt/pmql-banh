const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middlewares/auth.middleware");
const { getDanhSachNCC, themNCC, capNhatNCC, xoaNCC } = require("../controllers/nhacc.controller");

router.use(verifyToken, requireRole("QuanLy"));

router.get("/", getDanhSachNCC);
router.post("/", themNCC);
router.put("/:id", capNhatNCC);
router.delete("/:id", xoaNCC);

module.exports = router;