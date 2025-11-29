import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";
import db from "../db.js";

const router = Router();
router.use(authMiddleware);

// 1. Auto match (POST /api/matching/auto) - System/Trigger
router.post("/auto", (req, res) => {
  // TODO: Chạy thuật toán ghép cặp tự động
  res.json({ message: "Auto-matching process started", matchesFound: 5 });
});

// 2. Send match request (POST /api/matching/request) - Student chủ động mời Tutor
router.post("/request", async (req, res) => {
  const { tutorId, requestId } = req.body; // requestId là ID của "Yêu cầu tìm gia sư"
  try {
    const stuRes = await db.query(
      `SELECT StuID FROM Student WHERE Username = $1`,
      [req.user.username]
    );
    const stuId = stuRes.rows[0].stuid;

    // Insert vào bảng Ghép cặp với trạng thái chờ
    await db.query(
      `INSERT INTO "Ghép cặp" (RequestID, TutorID, StuID, "Trạng thái") VALUES ($1, $2, $3, 'Chờ xác nhận')`,
      [requestId, tutorId, stuId]
    );
    res.json({ message: "Đã gửi lời mời đến gia sư" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Accept/Reject request (POST /api/matching/request/:id/...) - Tutor xử lý
router.post("/request/:id/:action", async (req, res) => {
  const { id, action } = req.params; // id là MatchID
  const status = action === "accept" ? "Đã chấp nhận" : "Từ chối";

  try {
    if (req.user.role !== "tutor")
      return res.status(403).json({ message: "Access denied" });

    await db.query(
      `UPDATE "Ghép cặp" SET "Trạng thái" = $1 WHERE MatchID = $2`,
      [status, id]
    );

    res.json({ message: `Đã ${status} yêu cầu` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. List my matches (GET /api/matching/my-matches)
router.get("/my-matches", async (req, res) => {
  try {
    let sql, id;
    if (req.user.role === "student") {
      const userRes = await db.query(
        `SELECT StuID FROM Student WHERE Username = $1`,
        [req.user.username]
      );
      id = userRes.rows[0].stuid;
      sql = `SELECT gc.*, t."Họ tên" as PartnerName FROM "Ghép cặp" gc JOIN Tutor t ON gc.TutorID = t.TutorID WHERE gc.StuID = $1`;
    } else {
      const userRes = await db.query(
        `SELECT TutorID FROM Tutor WHERE Username = $1`,
        [req.user.username]
      );
      id = userRes.rows[0].tutorid;
      sql = `SELECT gc.*, s."Họ tên" as PartnerName FROM "Ghép cặp" gc JOIN Student s ON gc.StuID = s.StuID WHERE gc.TutorID = $1`;
    }

    const result = await db.query(sql, [id]);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
