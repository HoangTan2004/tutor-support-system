import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";
import db from "../db.js";

const router = Router();
router.use(authMiddleware);

// 1. Student feedback (POST /api/feedback/student) - Sinh viên đánh giá Gia sư
router.post("/student", async (req, res) => {
  const { sessionId, rating, comment, subject } = req.body;
  try {
    const stuRes = await db.query(
      `SELECT StuID FROM Student WHERE Username = $1`,
      [req.user.username]
    );
    const stuId = stuRes.rows[0].stuid;

    await db.query(
      `INSERT INTO "Đánh giá buổi học" ("Chấm điểm", "Nhận xét", "Môn học", StuID, "ID_buổi tư vấn")
         VALUES ($1, $2, $3, $4, $5)`,
      [rating, comment, subject, stuId, sessionId]
    );
    res.status(201).json({ message: "Cảm ơn bạn đã đánh giá!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get student feedback (GET /api/feedback/student/:id)
router.get("/student/:id", (req, res) => {
  // TODO: Xem feedback mình đã viết hoặc feedback về một session
  res.json({ rating: 5, comment: "Great tutor!" });
});

// 3. Tutor evaluation (POST /api/feedback/tutor) - Gia sư đánh giá Sinh viên
router.post("/tutor", async (req, res) => {
  const { studentId, subject, evaluation, score } = req.body;
  try {
    const tutorRes = await db.query(
      `SELECT TutorID FROM Tutor WHERE Username = $1`,
      [req.user.username]
    );
    const tutorId = tutorRes.rows[0].TutorID;

    await db.query(
      `INSERT INTO "Đánh giá tiến bộ sinh viên" ("Môn học", "Nhận xét", "Đánh giá", TutorID, StuID)
         VALUES ($1, $2, $3, $4, $5)`,
      [subject, evaluation, score, tutorId, studentId]
    );
    res.status(201).json({ message: "Đã lưu đánh giá sinh viên" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Get tutor feedback (GET /api/feedback/tutor/:id)
router.get("/tutor/:id", (req, res) => {
  res.json({ evaluation: "Hard working student", score: 9 });
});

// 5. Admin feedback summary (GET /api/feedback/admin/summary)
router.get("/admin/summary", (req, res) => {
  // Check admin role
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  res.json({
    averageRating: 4.5,
    totalFeedbacks: 150,
    reportedIssues: 2,
  });
});

export default router;
