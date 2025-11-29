import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";

const router = Router();
router.use(authMiddleware);

// Middleware kiểm tra quyền Admin cho toàn bộ file này
router.use((req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
});

// 1. List users (GET /api/admin/users)
router.get("/users", (req, res) => {
  // TODO: Lấy toàn bộ users
  res.json({
    count: 100,
    data: [
      { id: 1, username: "student1" },
      { id: 2, username: "teacher1" },
    ],
  });
});

// 2. Approve tutor (POST /api/admin/tutors/approve)
router.post("/tutors/approve", (req, res) => {
  const { tutorId } = req.body;
  // TODO: Đổi trạng thái tutor thành approved
  res.json({ message: `Tutor ${tutorId} approved` });
});

// 3. List tutors (GET /api/admin/tutors)
router.get("/tutors", (req, res) => {
  // TODO: Lấy danh sách gia sư chờ duyệt hoặc tất cả
  res.json({
    data: [{ id: 10, name: "Pending Tutor", status: "pending" }],
  });
});

// 4. System statistics (GET /api/admin/statistics)
router.get("/statistics", (req, res) => {
  res.json({
    totalUsers: 200,
    activeMatches: 50,
    sessionsThisMonth: 120,
  });
});

export default router;
