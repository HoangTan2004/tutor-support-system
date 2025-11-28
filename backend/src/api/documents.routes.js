import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";

const router = Router();
router.use(authMiddleware);

// 1. List documents (GET /api/documents)
router.get("/", (req, res) => {
  // TODO: Lấy danh sách tài liệu
  res.json({
    data: [
      { id: 1, title: "Math Advanced", type: "pdf", url: "/files/math.pdf" },
    ],
  });
});

// 2. Get document (GET /api/documents/:id)
router.get("/:id", (req, res) => {
  const { id } = req.params;
  res.json({ id, title: "Math Advanced", url: "/files/math.pdf" });
});

// 3. Share document (POST /api/documents/share)
router.post("/share", (req, res) => {
  const { documentId, targetUserId } = req.body;
  // TODO: Chia sẻ quyền truy cập
  res.json({ message: "Document shared successfully" });
});

export default router;
