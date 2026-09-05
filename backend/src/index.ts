import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./config/db";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend server is running" });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await testConnection();
});