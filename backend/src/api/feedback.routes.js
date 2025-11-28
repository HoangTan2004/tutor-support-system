import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";

const router = Router();
router.use(authMiddleware);

// 1. Student feedback (POST /api/feedback/student) - Sinh viên đánh giá Gia sư
router.post("/student", (req, res) => {
  const { sessionId, rating, comment } = req.body;
  // TODO: Lưu feedback
  res.status(201).json({ message: "Feedback submitted" });
});

// 2. Get student feedback (GET /api/feedback/student/:id)
router.get("/student/:id", (req, res) => {
  // TODO: Xem feedback mình đã viết hoặc feedback về một session
  res.json({ rating: 5, comment: "Great tutor!" });
});

// 3. Tutor evaluation (POST /api/feedback/tutor) - Gia sư đánh giá Sinh viên
router.post("/tutor", (req, res) => {
  const { studentId, evaluation, score } = req.body;
  // TODO: Lưu đánh giá về sinh viên
  res.status(201).json({ message: "Evaluation submitted" });
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
