import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";

// --- THAY ĐỔI 1: Import hàm xác thực từ DataCore ---
// Lưu ý: Đường dẫn import phải chính xác tương đối với vị trí file server.js
import { verifyUserCredentials } from "../hcmut_datacore/client.js";

const app = express();
const PORT = 5001;

const ALLOWED_ORIGINS = ["http://localhost:4000", "http://localhost:5173"];

// In-memory ticket store
const tickets = new Map();

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// GET /sso/login (Giữ nguyên giao diện HTML cũ)
app.get("/sso/login", (req, res) => {
  const service = req.query.service;
  if (!service) {
    return res.status(400).send("Missing service URL");
  }
  // ... (Code HTML giữ nguyên như cũ)
  res.send(`
<!DOCTYPE html>
    <html>
    <head>
      <title>Central Authentication Service</title>
      <style>
        body { font-family: Arial, sans-serif; background:#f5f5f5; }
        .wrapper { max-width: 600px; margin:40px auto; background:white; padding:30px; border-radius:8px; }
        h1 { background:#2b2c86; color:white; padding:10px 15px; margin:-30px -30px 20px; }
        label { display:block; margin-top:10px; }
        input[type=text], input[type=password] { width:100%; padding:8px; margin-top:4px; }
        button { margin-top:15px; padding:8px 16px; background:#2b2c86; color:white; border:none; cursor:pointer; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <h1>Central Authentication Service</h1>
        <h2>Enter your Username and Password</h2>
        <form method="POST" action="/sso/authenticate">
          <input type="hidden" name="service" value="${service}" />
          <label>Username</label>
          <input type="text" name="username" />
          <label>Password</label>
          <input type="password" name="password" />
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// --- THAY ĐỔI 2: Xử lý đăng nhập bằng DataCore (Async) ---
app.post("/sso/authenticate", async (req, res) => {
  const { username, password, service } = req.body;

  if (!service) return res.status(400).send("Missing service URL");

  try {
    // Gọi sang DataCore để kiểm tra user
    const user = await verifyUserCredentials(username, password);

    if (!user) {
      return res.status(401).send("Sai tên đăng nhập hoặc mật khẩu");
    }

    // Tạo ticket
    const ticket = "TICKET-" + uuidv4();
    tickets.set(ticket, {
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      service,
      createdAt: Date.now(),
    });

    const redirectUrl = new URL(service);
    redirectUrl.searchParams.set("ticket", ticket);
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Lỗi xác thực:", error);
    res.status(500).send("Internal Server Error");
  }
});

// GET /sso/validate (Giữ nguyên logic validate ticket)
app.get("/sso/validate", (req, res) => {
  const { ticket, service } = req.query;

  if (!ticket || !service) {
    return res
      .status(400)
      .json({ success: false, error: "Missing ticket or service" });
  }

  const info = tickets.get(ticket);
  if (!info) {
    return res.status(401).json({ success: false, error: "Invalid ticket" });
  }

  const MAX_AGE_MS = 5 * 60 * 1000;
  if (Date.now() - info.createdAt > MAX_AGE_MS) {
    tickets.delete(ticket);
    return res.status(401).json({ success: false, error: "Ticket expired" });
  }

  if (info.service !== service) {
    return res.status(401).json({ success: false, error: "Service mismatch" });
  }

  tickets.delete(ticket);

  // Trả về thông tin user đã lưu trong ticket
  return res.json({
    success: true,
    username: info.username,
    fullName: info.fullName, // Trả thêm fullName nếu cần
    role: info.role, // Trả thêm role nếu cần
  });
});

app.listen(PORT, () => {
  console.log(`SSO server running at http://localhost:${PORT}`);
});
