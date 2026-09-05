import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Manager Dashboard</h1>
      <p>Welcome, {user?.name} ({user?.role})</p>
      <button onClick={logout}>Logout</button>
      <p style={{ marginTop: "1rem", color: "#666" }}>
        (Team dashboard, charts, and filters will be built here)
      </p>
    </div>
  );
}
