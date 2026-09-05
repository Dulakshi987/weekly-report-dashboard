import { useAuth } from "../context/AuthContext";

export default function MyReports() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My Weekly Reports</h1>
      <p>Welcome, {user?.name} ({user?.role})</p>
      <button onClick={logout}>Logout</button>
      <p style={{ marginTop: "1rem", color: "#666" }}>
        (Report creation form and history list will be built here)
      </p>
    </div>
  );
}
