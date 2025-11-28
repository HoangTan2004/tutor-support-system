import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";

const router = Router();
router.use(authMiddleware);

// 1. Create registration (POST /api/registrations)
router.post("/", (req, res) => {
  const { subjectId, type, notes } = req.body;
  // TODO: Lưu đăng ký tìm gia sư vào DB
  res.status(201).json({
    message: "Registration created",
    data: { id: 123, subjectId, status: "pending" },
  });
});

// 2. List registrations (GET /api/registrations)
router.get("/", (req, res) => {
  // TODO: Lấy danh sách đăng ký của user hiện tại
  res.json({
    data: [
      { id: 1, subject: "Math", status: "pending" },
      { id: 2, subject: "Physics", status: "matched" },
    ],
  });
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
