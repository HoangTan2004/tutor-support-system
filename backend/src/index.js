import "./config.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./api/auth.routes.js";
import usersRoutes from "./api/users.routes.js";
import registrationRoutes from "./api/registrations.routes.js";
import tutorRoutes from "./api/tutors.routes.js";
import matchingRoutes from "./api/matching.routes.js";
import sessionRoutes from "./api/sessions.routes.js";
import feedbackRoutes from "./api/feedback.routes.js";
import documentRoutes from "./api/documents.routes.js";
import adminRoutes from "./api/admin.routes.js";
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

app.use("/users", usersRoutes);
app.use("/registrations", registrationRoutes);
app.use("/tutors", tutorRoutes);
app.use("/matching", matchingRoutes);
app.use("/sessions", sessionRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/documents", documentRoutes);
app.use("/admin", adminRoutes);

// Simple test route
app.get("/", (req, res) => {
  res.send("Tutor backend running with custom HCMUT SSO integration");
});

app.listen(PORT, () => {
  console.log(`Main backend running at http://localhost:${PORT}`);
});
