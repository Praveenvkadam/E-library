"use client";

import { useState } from "react";

const CATEGORIES = [  "ALL","Fiction", "Non-Fiction", "Science", "Technology", "kids",
  "Biography"];

export default function CategoryFilter({ active: externalActive, onChange }) {
  const [internalActive, setInternalActive] = useState("ALL");
  const active = externalActive !== undefined ? externalActive : internalActive;

  const handleClick = (cat) => {
    setInternalActive(cat);
    if (onChange) onChange(cat);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .cat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        @media (max-width: 400px) {
          .cat-header { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>
      <div className="cat-header">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3, width:22, height:22 }}>
            {[0,1,2,3].map((i) => (
              <div key={i} style={{ background:"#0d9488", borderRadius:2 }} />
            ))}
          </div>
          <span style={{ fontSize:22, fontWeight:800, color:"#1e293b" }}>Explore Categories</span>
        </div>
        <span style={{ color:"#0d9488", fontWeight:600, fontSize:14, cursor:"pointer" }}>View All</span>
      </div>

      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        {CATEGORIES.map((cat) => {
          const isActive = active === cat;
          return (
            <CategoryPill key={cat} label={cat} isActive={isActive} onClick={() => handleClick(cat)} />
          );
        })}
      </div>
    </div>
  );
}

function CategoryPill({ label, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "8px 20px",
        borderRadius: 40,
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        border: isActive ? "1.5px solid #1e293b" : hovered ? "1.5px solid #0d9488" : "1.5px solid #e2e8f0",
        background: isActive ? "#1e293b" : "#fff",
        color: isActive ? "#fff" : hovered ? "#0d9488" : "#475569",
        transition: "all .15s",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {label}
    </button>
  );
}