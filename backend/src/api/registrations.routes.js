import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";
import db from "../db.js";

const router = Router();
router.use(authMiddleware);

// 1. Create registration (POST /api/registrations) - Đăng tin tìm gia sư
router.post("/", async (req, res) => {
  const { subject, description } = req.body;
  try {
    if (req.user.role !== "student")
      return res
        .status(403)
        .json({ message: "Only students can request tutors" });

    const stuRes = await db.query(
      `SELECT StuID FROM Student WHERE Username = $1`,
      [req.user.username]
    );
    const stuId = stuRes.rows[0].stuid;

    const result = await db.query(
      `INSERT INTO "Yêu cầu tìm gia sư" (StuID, "Môn học", "Mô tả yêu cầu") VALUES ($1, $2, $3) RETURNING ID`,
      [stuId, subject, description]
    );

    res.status(201).json({
      message: "Đã gửi yêu cầu tìm gia sư",
      data: { id: result.rows[0].ID, subject, status: "Đang tìm" },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. List registrations (GET /api/registrations) - Xem lịch sử yêu cầu
router.get("/", async (req, res) => {
  try {
    const stuRes = await db.query(
      `SELECT StuID FROM Student WHERE Username = $1`,
      [req.user.username]
    );
    const stuId = stuRes.rows[0].stuid;

    const result = await db.query(
      `SELECT * FROM "Yêu cầu tìm gia sư" WHERE StuID = $1 ORDER BY "Ngày tạo" DESC`,
      [stuId]
    );

    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Get registration (GET /api/registrations/:id)
router.get("/:id", (req, res) => {
  const { id } = req.params;
  // TODO: Lấy chi tiết đăng ký
  res.json({ id, subject: "Math", notes: "Cần gia sư dạy buổi tối" });
});

// 4. Delete registration (DELETE /api/registrations/:id)
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  // TODO: Xóa đăng ký khỏi DB
  res.json({ message: `Registration ${id} deleted` });
});

export default router;
