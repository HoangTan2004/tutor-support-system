import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js"; // Đảm bảo bạn đã có file này
import db from "../db.js";

const router = Router();
router.use(authMiddleware);

// Helper: Lấy thông tin user từ DB dựa vào username và role
const getUserFromDB = async (username, role) => {
  if (role === "student") {
    const res = await db.query(`SELECT * FROM Student WHERE Username = $1`, [
      username,
    ]);
    return { type: "student", data: res.rows[0] };
  } else if (role === "tutor") {
    const res = await db.query(`SELECT * FROM Tutor WHERE Username = $1`, [
      username,
    ]);
    return { type: "tutor", data: res.rows[0] };
  }
  return null;
};

/**
 * 1. Get profile (GET /api/users/profile)
 */
router.get("/profile", async (req, res) => {
  try {
    const { username, role } = req.user;
    const user = await getUserFromDB(username, role || "student");

    if (!user || !user.data) {
      return res.status(404).json({ message: "User not found" });
    }

    // Map dữ liệu từ DB (Tiếng Việt) sang JSON response (Tiếng Anh/Việt tùy ý)
    res.json({
      message: "Get profile success",
      user: {
        username: user.data.Username,
        fullName: user.data["Họ tên"],
        email: user.data.Email,
        id: user.type === "student" ? user.data.stuid : user.data.tutorid,
        role: user.type,
        faculty: user.data.Khoa,
        major: user.data["Chuyên Ngành"],
        birthDate: user.data["Ngày sinh"],
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * 2. Update profile (PUT /api/users/profile)
 */
router.put("/profile", async (req, res) => {
  const { username, role } = req.user;
  const { email, chuyenNganh } = req.body;

  try {
    if (role === "tutor") {
      await db.query(
        `UPDATE Tutor SET Email = $1, "Chuyên Ngành" = $2 WHERE Username = $3`,
        [email, chuyenNganh, username]
      );
    } else {
      await db.query(
        `UPDATE Student SET Email = $1, "Chuyên Ngành" = $2 WHERE Username = $3`,
        [email, chuyenNganh, username]
      );
    }

    res.json({ message: "Cập nhật hồ sơ thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

export default router;
