import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";
import db from "../db.js";

const router = Router();
router.use(authMiddleware);

/**
 * 1. List student booked sessions (GET /api/sessions)
 * Xem các buổi học mà Sinh viên đã đăng ký
 */
router.get("/", async (req, res) => {
  try {
    if (req.user.role !== "student")
      return res.status(403).json({ message: "Access denied" });

    const stuRes = await db.query(
      `SELECT StuID FROM Student WHERE Username = $1`,
      [req.user.username]
    );
    const stuId = stuRes.rows[0].stuid;

    // Join bảng Đăng ký -> Buổi tư vấn -> Tutor để lấy chi tiết
    const sql = `
        SELECT bt.*, t."Họ tên" as TutorName, dk.ID as RegistrationID
        FROM "Đăng ký buổi tư vấn" dk
        JOIN "Buổi tư vấn" bt ON dk."ID_Buổi tư vấn" = bt.ID
        JOIN Tutor t ON bt.TutorID = t.TutorID
        WHERE dk.StuID = $1
        ORDER BY bt.ngày DESC
    `;
    const result = await db.query(sql, [stuId]);

    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * [NEW] 1.1 List AVAILABLE sessions (GET /api/sessions/available)
 * Xem danh sách các lớp "Sắp diễn ra" để sinh viên lựa chọn đăng ký
 */
router.get("/available", async (req, res) => {
  try {
    // Lấy danh sách các buổi tư vấn sắp diễn ra kèm tên Tutor
    // Sắp xếp theo ngày gần nhất trước
    const sql = `
        SELECT bt.*, t."Họ tên" as TutorName
        FROM "Buổi tư vấn" bt
        JOIN Tutor t ON bt.TutorID = t.TutorID
        WHERE bt."Trạng thái" = 'Sắp diễn ra'
        ORDER BY bt.ngày ASC, bt."Giờ bắt đầu" ASC
    `;
    const result = await db.query(sql);

    // Frontend có thể so sánh ID của list này với list "đã đăng ký"
    // để hiện nút "Đã đăng ký" hoặc "Đăng ký ngay"

    res.json({ data: result.rows });
  } catch (err) {
    console.error("Error in GET /api/sessions/available:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * 2. Get tutor free schedule
 */
router.get("/tutors/:tutorId/schedule", async (req, res) => {
  const { tutorId } = req.params;
  res.json({
    tutorId,
    freeSlots: ["Monday 19:00", "Wednesday 18:00"],
  });
});
/**
 * 3. Create session booking (POST /api/sessions/booking)
 * Body: { sessionId }
 */
router.post("/booking", async (req, res) => {
  const { sessionId } = req.body;
  try {
    if (req.user.role !== "student")
      return res.status(403).json({ message: "Access denied" });

    const stuRes = await db.query(
      `SELECT StuID FROM Student WHERE Username = $1`,
      [req.user.username]
    );
    const stuId = stuRes.rows[0].stuid;

    // Insert vào bảng Đăng ký
    await db.query(
      `INSERT INTO "Đăng ký buổi tư vấn" ("ID_Buổi tư vấn", StuID) VALUES ($1, $2)`,
      [sessionId, stuId]
    );

    res.status(201).json({ message: "Đăng ký lớp thành công" });
  } catch (err) {
    if (err.code === "23505") {
      // Mã lỗi Postgres cho Unique violation
      return res.status(400).json({ message: "Bạn đã đăng ký buổi này rồi" });
    }
    res.status(500).json({ message: "Đăng ký thất bại", error: err.message });
  }
});

/**
 * 4. Reschedule session
 */
router.put("/:id/reschedule", (req, res) => {
  const { id } = req.params;
  const { newTime } = req.body;
  res.json({ message: `Session ${id} rescheduled to ${newTime}` });
});

/**
 * 5. Cancel session (DELETE /api/sessions/:sessionId)
 * Hủy đăng ký
 */
router.delete("/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  try {
    const stuRes = await db.query(
      `SELECT StuID FROM Student WHERE Username = $1`,
      [req.user.username]
    );
    const stuId = stuRes.rows[0].stuid;

    await db.query(
      `DELETE FROM "Đăng ký buổi tư vấn" WHERE "ID_Buổi tư vấn" = $1 AND StuID = $2`,
      [sessionId, stuId]
    );

    res.json({ message: "Hủy đăng ký thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
