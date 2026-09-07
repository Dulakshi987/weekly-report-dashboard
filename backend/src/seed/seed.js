const bcrypt = require("bcrypt");
const db = require("../config/db"); 

async function seedAdmin() {
  const email = "admin@gmail.com";
  const plainPassword = "Admin@123";

  const [existing] = await db.query(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (existing.length > 0) {
    console.log("Admin already exists, skipping seed.");
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["System Admin", email, hashedPassword, "manager"]
  );

  console.log(`Admin seeded: ${email} / ${plainPassword}`);
}

module.exports = seedAdmin;