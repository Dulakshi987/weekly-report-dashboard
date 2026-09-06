import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { pool } from "../config/db.js"; 

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

describe("RBAC Authorization Tests", () => {
  const managerToken = jwt.sign(
    {
      id: 1,
      email: "manager@test.com",
      role: "manager",
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  const teamMemberToken = jwt.sign(
    {
      id: 2,
      email: "member@test.com",
      role: "team_member",
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  describe("User Management - /api/users", () => {
    test("Manager should be allowed to access users", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    test("Team member should be denied access to users", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${teamMemberToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "Access denied: insufficient permissions"
      );
    });

    test("Unauthenticated user should be denied access", async () => {
      const response = await request(app).get("/api/users");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("Project Management - /api/projects", () => {
    test("Manager should be allowed to create projects", async () => {
      const response = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${managerToken}`)
        .send({
          name: "RBAC Test Project",
          description: "Automated RBAC test",
        });

      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    test("Team member should NOT be allowed to create projects", async () => {
      const response = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${teamMemberToken}`)
        .send({
          name: "Unauthorized Project",
          description: "This should fail",
        });

      expect(response.status).toBe(403);
    });
  });

  describe("Dashboard Statistics - /api/stats/dashboard", () => {
    test("Manager should be allowed to access dashboard statistics", async () => {
      const response = await request(app)
        .get("/api/stats/dashboard")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    test("Team member should be denied dashboard statistics", async () => {
      const response = await request(app)
        .get("/api/stats/dashboard")
        .set("Authorization", `Bearer ${teamMemberToken}`);

      expect(response.status).toBe(403);
    });

    test("Unauthenticated user should be denied dashboard statistics", async () => {
      const response = await request(app).get(
        "/api/stats/dashboard"
      );

      expect(response.status).toBe(401);
    });
  });

  describe("Report Management - Manager Only Routes", () => {
    test("Manager should be allowed to view all reports", async () => {
      const response = await request(app)
        .get("/api/reports")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    test("Team member should NOT be allowed to view all reports", async () => {
      const response = await request(app)
        .get("/api/reports")
        .set("Authorization", `Bearer ${teamMemberToken}`);

      expect(response.status).toBe(403);
    });

    test("Team member should NOT be allowed to review reports", async () => {
      const response = await request(app)
        .put("/api/reports/1/review")
        .set("Authorization", `Bearer ${teamMemberToken}`)
        .send({
          action: "approved",
          comment: "Test",
        });

      expect(response.status).toBe(403);
    });
  });
});

afterAll(async () => {
  await pool.end();
});