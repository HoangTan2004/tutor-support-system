import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";

const router = Router();
router.use(authMiddleware);

// 1. Auto match (POST /api/matching/auto) - System/Trigger
router.post("/auto", (req, res) => {
  // TODO: Chạy thuật toán ghép cặp tự động
  res.json({ message: "Auto-matching process started", matchesFound: 5 });
});

// 2. Send match request (POST /api/matching/request) - Student
router.post("/request", (req, res) => {
  const { tutorId, subjectId } = req.body;
  // TODO: Gửi yêu cầu học tới gia sư
  res.json({ message: "Match request sent to tutor" });
});

// 3. Accept request (POST /api/matching/request/:id/accept) - Tutor
router.post("/request/:id/accept", (req, res) => {
  const { id } = req.params; // requestID
  // TODO: Cập nhật trạng thái thành 'matched'
  res.json({ message: `Request ${id} accepted` });
});

// 4. Reject request (POST /api/matching/request/:id/reject) - Tutor
router.post("/request/:id/reject", (req, res) => {
  const { id } = req.params;
  // TODO: Từ chối yêu cầu
  res.json({ message: `Request ${id} rejected` });
});

// 5. List my matches (GET /api/matching/my-matches)
router.get("/my-matches", (req, res) => {
  // TODO: Lấy danh sách các cặp đã ghép thành công của user
  res.json({
    data: [{ matchId: 55, partnerName: "Nguyen Van B", subject: "Math" }],
  });
});

export default router;
