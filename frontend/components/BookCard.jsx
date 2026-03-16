"use client";

import { useState, useEffect } from "react";
import useBookStore from "@/store/usebookstore";

const COVER_PAIRS = [
  { bg: "#0f172a", cover: "#1e3a5f" },
  { bg: "#1a0a2e", cover: "#4a1d6e" },
  { bg: "#0d2b1a", cover: "#145a32" },
  { bg: "#2d1200", cover: "#7c3500" },
  { bg: "#1a1a2e", cover: "#16213e" },
  { bg: "#2c0a0a", cover: "#7b1212" },
];

// ─── BookThumb ────────────────────────────────────────────────────────────────
function BookThumb({ book }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>

      {/* Book shape */}
      <div style={{
        position: "absolute", inset: "12px 20px 12px 16px",
        borderRadius: "2px 6px 6px 2px",
        overflow: "hidden",
        boxShadow: "-4px 4px 12px rgba(0,0,0,.35), inset -3px 0 8px rgba(0,0,0,.2)",
        display: "flex",
      }}>

        {/* Spine */}
        <div style={{
          width: 14,
          flexShrink: 0,
          background: "rgba(0,0,0,.35)",
        }} />

        {/* Cover */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {book.imageUrl ? (
            <img
              src={book.imageUrl}
              alt={book.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: book.cover }} />
          )}

          {/* Glare */}
          <div style={{
            position: "absolute", top: 0, left: 0,
            width: 18, height: "100%",
            background: "linear-gradient(to right, rgba(255,255,255,.18), transparent)",
            pointerEvents: "none",
          }} />
        </div>
      </div>

      {/* Page stack */}
      <div style={{
        position: "absolute",
        top: "14px", right: "18px", bottom: "14px",
        width: 5,
        background: "linear-gradient(to right, #e2e8f0, #f8fafc)",
        borderRadius: "0 3px 3px 0",
        boxShadow: "2px 0 4px rgba(0,0,0,.1)",
      }} />
    </div>
  );
}

// ─── Single BookCard ──────────────────────────────────────────────────────────
export function BookCard({ book, onBorrow }) {
  const [hovered,    setHovered]    = useState(false);
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
      {/* Thumbnail */}
      <div style={{ position: "relative", height: 220, background: "#f1f5f9" }}>
        <BookThumb book={book} />
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
          READ
        </button>
      </div>
    </div>
  );
}

// ─── PDF Modal ────────────────────────────────────────────────────────────────
function PdfModal({ book, onClose }) {
  if (!book) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16,
          width: "min(90vw, 900px)", height: "85vh",
          display: "flex", flexDirection: "column",
          overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,.3)",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid #f1f5f9",
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", fontFamily: "'Inter',sans-serif" }}>
              {book.title}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'Inter',sans-serif" }}>
              {book.author}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9", border: "none", borderRadius: 8,
              padding: "6px 14px", cursor: "pointer",
              fontSize: 13, color: "#475569", fontFamily: "'Inter',sans-serif",
            }}
          >
            Close
          </button>
        </div>

        {book.pdfUrl ? (
          <iframe src={book.pdfUrl} title={book.title} style={{ flex: 1, border: "none" }} />
        ) : (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            color: "#94a3b8", fontSize: 15, fontFamily: "'Inter',sans-serif",
          }}>
            No PDF available for this book.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Default export ───────────────────────────────────────────────────────────
export default function BookCards() {
  const { books, isLoadingList, error, loadAll } = useBookStore();
  const [activeBook, setActiveBook] = useState(null);



  const cardBooks = books.map((b, i) => ({
    id:       b.b_id,
    title:    b.b_name     || "Untitled",
    author:   b.b_author   || "Unknown",
    genre:    b.b_category || "General",
    pdfUrl:   b.b_pdfUrl,
    imageUrl: b.b_imageUrl,
    ...COVER_PAIRS[i % COVER_PAIRS.length],
  }));

  if (isLoadingList) return (
    <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>
      Loading books…
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "80px 0", color: "#e11d48", fontFamily: "'Inter',sans-serif" }}>
      {error}
    </div>
  );

  if (cardBooks.length === 0) return (
    <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>
      No books found.
    </div>
  );

  return (
    <>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
        gap: 24,
      }}>
        {cardBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onBorrow={() => setActiveBook(book)}
          />
        ))}
      </div>

      <PdfModal book={activeBook} onClose={() => setActiveBook(null)} />
    </>
  );
}