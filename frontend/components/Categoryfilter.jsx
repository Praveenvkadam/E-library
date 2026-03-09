import { useState } from "react";

const CATEGORIES = ["Fiction", "Non-Fiction", "Science", "Technology", "History", "Biography", "Kids"];

// ── CategoryFilter ────────────────────────────────────────────────────────────
// Accepts optional `active` & `onChange` props for controlled usage.
// Falls back to internal state when used standalone.
export default function CategoryFilter({ active: externalActive, onChange }) {
  const [internalActive, setInternalActive] = useState("Fiction");

  const active = externalActive ?? internalActive;
  const handleClick = (cat) => {
    setInternalActive(cat);
    onChange?.(cat);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header row ── */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Grid icon */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 3, width: 22, height: 22,
          }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: "#0d9488", borderRadius: 2 }} />
            ))}
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#1e293b" }}>
            Explore Categories
          </span>
        </div>

        <span style={{ color: "#0d9488", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          View All
        </span>
      </div>

      {/* ── Pills ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              onClick={() => handleClick(cat)}
              style={{
                padding: "8px 20px",
                borderRadius: 40,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                border: `1.5px solid ${isActive ? "#1e293b" : "#e2e8f0"}`,
                background: isActive ? "#1e293b" : "#fff",
                color: isActive ? "#fff" : "#475569",
                transition: "all .15s",
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "#0d9488";
                  e.currentTarget.style.color = "#0d9488";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.color = "#475569";
                }
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}