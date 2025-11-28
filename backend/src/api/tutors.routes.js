import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";

const router = Router();
router.use(authMiddleware);

// 1. Search tutors (GET /api/tutors/search) - Student
router.get("/search", (req, res) => {
  const { subject, level } = req.query;
  // TODO: Tìm kiếm gia sư trong DB
  res.json({
    data: [
      { id: 101, name: "Nguyen Van A", subject: "Math", rating: 4.5 },
      { id: 102, name: "Tran Thi B", subject: "Math", rating: 5.0 },
    ],
  });
});

// 2. List tutor sessions (GET /api/tutors/sessions) - Tutor (lấy các session do mình tạo)
router.get("/sessions", (req, res) => {
  // TODO: Lấy danh sách các lớp/ca dạy của gia sư
  res.json({
    data: [{ id: 1, time: "Monday 19:00", status: "open" }],
  });
});

// 3. Create tutor session (POST /api/tutors/sessions) - Tutor
router.post("/sessions", (req, res) => {
  const { time, subject, maxStudents } = req.body;
  // TODO: Tạo ca dạy mới
  res.status(201).json({ message: "Session created", id: 999 });
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
