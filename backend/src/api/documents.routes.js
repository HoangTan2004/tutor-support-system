import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";
import db from "../db.js";

const router = Router();
router.use(authMiddleware);

// 1. List documents (GET /api/documents)
router.get("/", async (req, res) => {
  try {
    // Lấy tất cả tài liệu public
    const result = await db.query(
      `SELECT * FROM "Tài liệu" ORDER BY "Ngày upload" DESC`
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get document (GET /api/documents/:id)
router.get("/:id", (req, res) => {
  const { id } = req.params;
  res.json({ id, title: "Math Advanced", url: "/files/math.pdf" });
});

// 3. Share document (POST /api/documents/share) Mockup - chưa có logic upload file thật
router.post("/share", async (req, res) => {
  const { title, description } = req.body;
  try {
    const tutorRes = await db.query(
      `SELECT TutorID FROM Tutor WHERE Username = $1`,
      [req.user.username]
    );
    if (tutorRes.rows.length === 0)
      return res.status(403).json({ message: "Only tutor can upload" });
    const tutorId = tutorRes.rows[0].TutorID;

    await db.query(
      `INSERT INTO "Tài liệu" ("Tiêu đề", "Mô tả", "ID người đăng") VALUES ($1, $2, $3)`,
      [title, description, tutorId]
    );
    res.json({ message: "Upload tài liệu thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
