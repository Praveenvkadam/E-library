"use client";

// ── BookCard.jsx ──────────────────────────────────────────────────────────────
import { useState } from "react";

function BookThumb({ book }) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <rect width="120" height="160" rx="4" fill={book.bg} />
      <rect x="0" y="0" width="10" height="160" rx="2" fill="rgba(0,0,0,.25)" />
      <rect x="10" y="0" width="110" height="160" rx="2" fill={book.cover} />
      <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,.9)"
        fontSize="8" fontWeight="bold" fontFamily="Georgia,serif">
        {book.title.split(" ").slice(0, 2).join(" ")}
      </text>
      <text x="60" y="85" textAnchor="middle" fill="rgba(255,255,255,.7)"
        fontSize="7" fontFamily="Georgia,serif">
        {book.title.split(" ").slice(2).join(" ")}
      </text>
      <line x1="20" y1="128" x2="100" y2="128" stroke="rgba(255,255,255,.15)" strokeWidth=".5" />
      <text x="60" y="143" textAnchor="middle" fill="rgba(255,255,255,.5)"
        fontSize="5.5" fontFamily="sans-serif">
        {book.author}
      </text>
      <rect x="10" y="0" width="16" height="160" fill="white" opacity=".04" />
    </svg>
  );
}

export default function BookCard({ book, onBorrow }) {
  const [hovered, setHovered]       = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hovered
          ? "0 10px 30px rgba(0,0,0,.13)"
          : "0 2px 12px rgba(0,0,0,.07)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "transform .2s, box-shadow .2s",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Cover */}
      <div style={{ position: "relative", height: 200 }}>
        <BookThumb book={book} />
        {book.badge && (
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: book.badgeColor ?? "#f97316",
            color: "white",
            fontSize: 10, fontWeight: 700,
            padding: "3px 8px", borderRadius: 4,
            letterSpacing: ".5px",
          }}>
            {book.badge}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#0d9488", letterSpacing: "1px", marginBottom: 4 }}>
          {book.genre}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 3 }}>
          {book.title}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>
          {book.author}
        </div>

        {/* Borrow button */}
        <button
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          onClick={() => onBorrow?.(book)}
          style={{
            width: "100%",
            background: btnHovered ? "#f0fdfa" : "#fff",
            color: "#0d9488",
            border: `1.5px solid ${btnHovered ? "#0d9488" : "#e2e8f0"}`,
            borderRadius: 10,
            padding: "9px 0",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transform: btnHovered ? "translateY(-1px)" : "translateY(0)",
            transition: "background .15s, border-color .15s, transform .15s",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
          Borrow
        </button>
      </div>
    </div>
  );
}