import { Router } from "express";
import jwt from "jsonwebtoken";
import {
  getSsoLoginUrl,
  validateTicket,
} from "../integrations/hcmut_sso/sso.client.js";
import { authMiddleware } from "./auth.middleware.js";

const router = Router();

const BACKEND_URL = "http://localhost:4000";
const FRONTEND_URL = "http://localhost:5173";
const SERVICE_URL = `${BACKEND_URL}/auth/callback`;
const JWT_SECRET = process.env.JWT_SECRET;

// console.log("JWT_SECRET =", process.env.JWT_SECRET);

// Start login: redirect to SSO
router.get("/login", (req, res) => {
  const url = getSsoLoginUrl(SERVICE_URL);
  return res.redirect(url);
});

// SSO callback: ?ticket=...
router.get("/callback", async (req, res) => {
  const { ticket } = req.query;
  if (!ticket) return res.status(400).send("Missing ticket");

  try {
    const result = await validateTicket(ticket, SERVICE_URL);
    if (!result.success) {
      return res.status(401).send("Ticket invalid: " + (result.error || ""));
    }

    const { username, fullName, role } = result;

    const token = jwt.sign({ username, fullName, role }, JWT_SECRET, {
      expiresIn: "2h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      // secure: true in production over HTTPS
    });

    return res.redirect(`${FRONTEND_URL}/login-success`);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error validating ticket");
  }
});

router.post("/logout", (req, res) => {
  // Xóa cookie chứa token
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/", // Đảm bảo path trùng với lúc set cookie
  });

  return res.json({ message: "Đăng xuất thành công" });
});

// Example protected endpoint
router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;
