export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={styles.wrap}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={{ ...styles.btn, ...(page <= 1 ? styles.btnDisabled : {}) }}
      >
        ← Previous
      </button>
      <span style={styles.pageLabel}>
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={{ ...styles.btn, ...(page >= totalPages ? styles.btnDisabled : {}) }}
      >
        Next →
      </button>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    marginTop: "1.25rem",
  },
  btn: {
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#334155",
    fontFamily: "inherit",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  pageLabel: {
    fontFamily: "inherit",
    fontSize: "0.85rem",
    color: "#64748b",
    fontWeight: 500,
  },
};