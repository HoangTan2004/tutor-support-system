import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix directory resolution since ES modules don't have __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersPath = path.join(__dirname, "users.json");
const usersDB = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = 5001;

// For demo:
const ALLOWED_ORIGINS = ["http://localhost:4000", "http://localhost:5173"];

// In-memory ticket store (lost when server restarts – OK for project)
const tickets = new Map(); // ticket -> { username, service, createdAt }

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// GET /sso/login?service=...
app.get("/sso/login", (req, res) => {
  const service = req.query.service;
  if (!service) {
    return res.status(400).send("Missing service URL");
  }

  // Simple HTML login page (you can style this to look like HCMUT SSO)
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

// POST /sso/authenticate
app.post("/sso/authenticate", (req, res) => {
  const { username, password, service } = req.body;

  if (!service) return res.status(400).send("Missing service URL");

  const users = usersDB.users;

  // Find user in DB
  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).send("User does not exist");
  }

  // Check password
  if (user.password !== password) {
    return res.status(401).send("Wrong password");
  }

  // Create ticket
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
});

// GET /sso/validate?ticket=...&service=...
// This is what your main backend will call
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

  // Optional: ticket expiry (5 minutes)
  const MAX_AGE_MS = 5 * 60 * 1000;
  if (Date.now() - info.createdAt > MAX_AGE_MS) {
    tickets.delete(ticket);
    return res.status(401).json({ success: false, error: "Ticket expired" });
  }

  // Ensure ticket used for correct service
  if (info.service !== service) {
    return res.status(401).json({ success: false, error: "Service mismatch" });
  }

  // Single-use ticket
  tickets.delete(ticket);

  return res.json({
    success: true,
    username: info.username,
  });
});

app.listen(PORT, () => {
  console.log(`SSO server running at http://localhost:${PORT}`);
});
