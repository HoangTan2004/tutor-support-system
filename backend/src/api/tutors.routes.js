import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";
import db from "../db.js";

const router = Router();
router.use(authMiddleware);

/**
 * 1. Search tutors (GET /api/tutors/search)
 * Query params: ?subject=Web&name=An
 */
router.get("/search", async (req, res) => {
  const { subject, name } = req.query;
  try {
    let sql = `SELECT * FROM Tutor WHERE "Trạng thái" = 'Hoạt động'`;
    const params = [];

    if (subject) {
      params.push(`%${subject}%`);
      sql += ` AND "Chuyên Ngành" ILIKE $${params.length}`;
    }
    if (name) {
      params.push(`%${name}%`);
      sql += ` AND "Họ tên" ILIKE $${params.length}`;
    }

    const result = await db.query(sql, params);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 2. List tutor sessions (GET /api/tutors/sessions)
 * Lấy danh sách các lớp do Tutor hiện tại dạy
 */
router.get("/sessions", async (req, res) => {
  try {
    // Check role
    if (req.user.role !== "tutor")
      return res.status(403).json({ message: "Access denied" });

    // Lấy TutorID
    const tutorRes = await db.query(
      `SELECT TutorID FROM Tutor WHERE Username = $1`,
      [req.user.username]
    );
    if (tutorRes.rows.length === 0)
      return res.status(404).json({ message: "Tutor info not found" });
    const tutorId = tutorRes.rows[0].tutorid;

    // Query bảng Buổi tư vấn
    const sessions = await db.query(
      `SELECT * FROM "Buổi tư vấn" WHERE TutorID = $1 ORDER BY ngày DESC`,
      [tutorId]
    );

    res.json({ data: sessions.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 3. Create tutor session (POST /api/tutors/sessions)
 */
router.post("/sessions", async (req, res) => {
  const { ngay, tietBatDau, tietKetThuc, chuDe, hinhThuc } = req.body;

  try {
    if (req.user.role !== "tutor")
      return res.status(403).json({ message: "Access denied" });

    const tutorRes = await db.query(
      `SELECT TutorID FROM Tutor WHERE Username = $1`,
      [req.user.username]
    );
    const tutorId = tutorRes.rows[0].tutorid;

    // Insert và trả về ID vừa tạo
    const insertRes = await db.query(
      `INSERT INTO "Buổi tư vấn" (TutorID, ngày, "Tiết bắt đầu", "Tiết kết thúc", "Chủ đề", "Hình thức")
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING ID`,
      [tutorId, ngay, tietBatDau, tietKetThuc, chuDe, hinhThuc || "Trực tiếp"]
    );

    res.status(201).json({
      message: "Tạo buổi tư vấn thành công",
      id: insertRes.rows[0].ID,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Lỗi tạo buổi tư vấn", error: err.message });
  }
});

// 4. Update tutor session (PUT /api/tutors/sessions/:id)
router.put("/sessions/:id", (req, res) => {
  const { id } = req.params;
  // TODO: Cập nhật thông tin ca dạy
  res.json({ message: `Session ${id} updated` });
});

// 5. Delete tutor session (DELETE /api/tutors/sessions/:id)
router.delete("/sessions/:id", (req, res) => {
  const { id } = req.params;
  // TODO: Hủy ca dạy
  res.json({ message: `Session ${id} deleted` });
});

export default router;
