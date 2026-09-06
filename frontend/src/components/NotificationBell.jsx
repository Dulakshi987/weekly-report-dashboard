import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const LAST_SEEN_KEY = "notif_last_seen_submitted_at";
const POLL_INTERVAL_MS = 30000;

export default function NotificationBell() {
  const [reports, setReports] = useState([]);
  const [open, setOpen] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);

  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSubmitted();

    const interval = setInterval(
      loadSubmitted,
      POLL_INTERVAL_MS
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  async function loadSubmitted() {
    try {
      const res = await api.get("/reports", {
        params: {
          status: "submitted",
          limit: 50,
        },
      });

      const list = res.data.reports || [];

      list.sort(
        (a, b) =>
          new Date(b.submitted_at).getTime() -
          new Date(a.submitted_at).getTime()
      );

      setReports(list);

      const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
      const lastSeenTime = lastSeen
        ? new Date(lastSeen).getTime()
        : 0;

      const unseen = list.filter(
        (r) =>
          new Date(r.submitted_at).getTime() >
          lastSeenTime
      );

      setUnseenCount(unseen.length);
    } catch (err) {
      console.error(
        "Failed to load notifications",
        err
      );
    }
  }

  function handleBellClick() {
    setOpen((prev) => !prev);

    if (!open && reports.length > 0) {
      // Mark newest one as seen once the popup is opened
      localStorage.setItem(
        LAST_SEEN_KEY,
        reports[0].submitted_at
      );

      setUnseenCount(0);
    }
  }

  function handleReportClick(reportId) {
    setOpen(false);
    navigate(`/reports/${reportId}`);
  }

  function timeAgo(dateStr) {
    const diffMs =
      Date.now() - new Date(dateStr).getTime();

    const mins = Math.floor(diffMs / 60000);

    if (mins < 1) return "just now";

    if (mins < 60) return `${mins}m ago`;

    const hrs = Math.floor(mins / 60);

    if (hrs < 24) return `${hrs}h ago`;

    const days = Math.floor(hrs / 24);

    return `${days}d ago`;
  }

  return (
    <div
      ref={wrapperRef}
      style={styles.wrapper}
    >
      <button
        onClick={handleBellClick}
        style={styles.bellBtn}
        aria-label="Notifications"
      >
        <span style={{ fontSize: "1.25rem" }}>
          🔔
        </span>

        {unseenCount > 0 && (
          <span style={styles.badge}>
            {unseenCount > 9
              ? "9+"
              : unseenCount}
          </span>
        )}
      </button>

      {open && (
        <div style={styles.popup}>
          <div style={styles.popupHeader}>
            <strong>Submitted Reports</strong>

            <span style={styles.popupSubtitle}>
              {reports.length} awaiting review
            </span>
          </div>

          <div style={styles.popupList}>
            {reports.length === 0 ? (
              <div style={styles.emptyState}>
                No reports submitted for review
                right now.
              </div>
            ) : (
              reports.map((r) => (
                <div
                  key={r.id}
                  style={styles.item}
                  onClick={() =>
                    handleReportClick(r.id)
                  }
                >
                  <div style={styles.itemAvatar}>
                    {r.user_name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div style={styles.itemBody}>
                    <div style={styles.itemTitle}>
                      <strong>
                        {r.user_name}
                      </strong>{" "}
                      submitted a report
                    </div>

                    <div style={styles.itemMeta}>
                      {r.project_name
                        ? `${r.project_name} · `
                        : ""}

                      {r.week_start?.slice(0, 10)}
                      {" → "}
                      {r.week_end?.slice(0, 10)}
                    </div>
                  </div>

                  <div style={styles.itemTime}>
                    {timeAgo(r.submitted_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
  },

  bellBtn: {
    position: "relative",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.4rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    position: "absolute",
    top: "-2px",
    right: "-2px",
    background: "#dc2626",
    color: "#fff",
    fontSize: "0.65rem",
    fontWeight: 700,
    borderRadius: "9px",
    minWidth: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 3px",
  },

  popup: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    width: "340px",
    maxHeight: "420px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow:
      "0 8px 24px rgba(0,0,0,0.15)",
    border: "1px solid #f1f5f9",
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  popupHeader: {
    padding: "0.85rem 1rem",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  popupSubtitle: {
    fontSize: "0.75rem",
    color: "#94a3b8",
  },

  popupList: {
    overflowY: "auto",
    flex: 1,
  },

  emptyState: {
    padding: "1.5rem 1rem",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.85rem",
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    padding: "0.7rem 1rem",
    borderBottom: "1px solid #f8fafc",
    cursor: "pointer",
  },

  itemAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.9rem",
    flexShrink: 0,
  },

  itemBody: {
    flex: 1,
    minWidth: 0,
  },

  itemTitle: {
    fontSize: "0.83rem",
    color: "#0f172a",
  },

  itemMeta: {
    fontSize: "0.75rem",
    color: "#64748b",
    marginTop: "1px",
  },

  itemTime: {
    fontSize: "0.72rem",
    color: "#94a3b8",
    whiteSpace: "nowrap",
  },
};