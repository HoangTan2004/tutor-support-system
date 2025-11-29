import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";

const router = Router();
router.use(authMiddleware);

// 1. List student sessions (GET /api/sessions) - Các buổi học sắp tới
router.get("/", (req, res) => {
  // TODO: Lấy lịch học
  res.json({
    data: [
      { id: 1, subject: "Math", tutor: "Mr. A", time: "2023-11-20T19:00:00Z" },
    ],
  });
});

// 2. Get tutor free schedule (GET /api/sessions/tutors/:tutorId/schedule)
router.get("/tutors/:tutorId/schedule", (req, res) => {
  const { tutorId } = req.params;
  // TODO: Lấy các slot trống của gia sư
  res.json({
    tutorId,
    freeSlots: ["Monday 19:00", "Wednesday 18:00"],
  });
});

// 3. Create session booking (POST /api/sessions/booking)
router.post("/booking", (req, res) => {
  const { tutorId, slotTime, subject } = req.body;
  // TODO: Book lịch
  res.status(201).json({ message: "Session booked successfully" });
});

// 4. Reschedule session (PUT /api/sessions/:id/reschedule)
router.put("/:id/reschedule", (req, res) => {
  const { id } = req.params;
  const { newTime } = req.body;
  // TODO: Đổi lịch
  res.json({ message: `Session ${id} rescheduled to ${newTime}` });
});

// 5. Cancel session (DELETE /api/sessions/:id)
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  // TODO: Hủy buổi học
  res.json({ message: `Session ${id} cancelled` });
});

export default router;
