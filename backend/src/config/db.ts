import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Connection pool - reuses connections instead of opening a new one per query
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "weekly_report_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Quick test function to verify connection on server start
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL connected successfully");
    connection.release();
  } catch (error) {
    console.error("❌ MySQL connection failed:", error);
    process.exit(1);
  }
}