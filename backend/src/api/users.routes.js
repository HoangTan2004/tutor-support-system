import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";

const router = Router();

// Áp dụng middleware xác thực cho tất cả các route bên dưới
router.use(authMiddleware);

// 1. Get profile (GET /api/users/profile)
router.get("/profile", (req, res) => {
  // TODO: Query DB để lấy thông tin chi tiết user dựa vào req.user.username/id
  res.json({
    message: "Get profile success",
    user: req.user, // Thông tin từ token
    profile: {
      bio: "Đang cập nhật...",
      subjects: ["Math", "Physics"],
    },
  });
});

// 2. Update profile (PUT /api/users/profile) - Student/Tutor
router.put("/profile", (req, res) => {
  const { bio, subjects, availability } = req.body;
  // TODO: Update DB
  res.json({
    message: "Profile updated successfully",
    updatedFields: { bio, subjects, availability },
  });
});

// 3. Sync from Datacore (POST /api/users/sync) - System/Internal
router.post("/sync", async (req, res) => {
  try {
    // TODO: Gọi service kết nối DataCore để đồng bộ thông tin mới nhất
    res.json({ message: "Synced data from DataCore successfully" });
  } catch (error) {
    res.status(500).json({ message: "Sync failed", error: error.message });
  }
});

export default router;
