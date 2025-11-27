import "./config.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./auth/auth.routes.js";

const app = express();
const PORT = 4000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Auth routes
app.use("/auth", authRoutes);

// Simple test route
app.get("/", (req, res) => {
  res.send("Tutor backend running with custom HCMUT SSO integration");
});

app.listen(PORT, () => {
  console.log(`Main backend running at http://localhost:${PORT}`);
});
// console.log("JWT_SECRET =", process.env.JWT_SECRET);
