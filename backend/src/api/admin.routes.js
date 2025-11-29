import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";
import db from "../db.js";

const router = Router();
router.use(authMiddleware);

// Middleware kiểm tra quyền Admin cho toàn bộ file này
router.use((req, res, next) => {
  // Logic giả định: user 'admin' hoặc check DB
  if (req.user.username === "admin" || req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
});

// 1. List all users
router.get("/users", async (req, res) => {
  try {
    // Sử dụng View 'users' đã tạo trong seed.js
    const result = await db.query(`SELECT * FROM users ORDER BY username ASC`);
    res.json({ count: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
router.get("/statistics", async (req, res) => {
  try {
    const usersCount = await db.query(`SELECT COUNT(*) FROM users`);
    const sessionsCount = await db.query(`SELECT COUNT(*) FROM "Buổi tư vấn"`);

    res.json({
      totalUsers: usersCount.rows[0].count,
      totalSessions: sessionsCount.rows[0].count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
