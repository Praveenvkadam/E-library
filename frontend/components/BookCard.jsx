"use client";

import { useState } from "react";
import useBookStore from "@/store/usebookstore";

const COVER_COLORS = [
  { spine: "#1e3a5f", cover: "#2563eb", accent: "#93c5fd" },
  { spine: "#4a1d6e", cover: "#7c3aed", accent: "#c4b5fd" },
  { spine: "#145a32", cover: "#16a34a", accent: "#86efac" },
  { spine: "#7c3500", cover: "#ea580c", accent: "#fdba74" },
  { spine: "#7b1212", cover: "#dc2626", accent: "#fca5a5" },
  { spine: "#164e63", cover: "#0891b2", accent: "#67e8f9" },
];

/* ─── 3D Book ──────────────────────────────────────────────────────────────── */
function Book3D({ book, hovered }) {
  const palette = COVER_COLORS[
    Math.abs(book.title?.charCodeAt(0) ?? 0) % COVER_COLORS.length
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "600px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 130,
          height: 180,
          transformStyle: "preserve-3d",
          transform: hovered
            ? "rotateY(-25deg) rotateX(4deg)"
            : "rotateY(-15deg) rotateX(2deg)",
          transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          filter: hovered
            ? "drop-shadow(-16px 20px 28px rgba(0,0,0,0.55))"
            : "drop-shadow(-8px 12px 18px rgba(0,0,0,0.4))",
        }}
      >
        {/* ── Front Cover ── */}
        <div
          style={{
            position: "absolute",
            width: 130,
            height: 180,
            background: palette.cover,
            borderRadius: "2px 5px 5px 2px",
            overflow: "hidden",
            backfaceVisibility: "hidden",
          }}
        >
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
            /* Fallback illustrated cover */
            <div
              style={{
                width: "100%",
                height: "100%",
                background: `linear-gradient(135deg, ${palette.cover} 0%, ${palette.spine} 100%)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 10px",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `2px solid ${palette.accent}`,
                  opacity: 0.6,
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: palette.accent,
                  textAlign: "center",
                  lineHeight: 1.3,
                  fontFamily: "'Georgia', serif",
                  wordBreak: "break-word",
                }}
              >
                {book.title}
              </div>
            </div>
          )}

          {/* Glare streak */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 22,
              height: "100%",
              background:
                "linear-gradient(to right, rgba(255,255,255,0.20), transparent)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* ── Spine ── */}
        <div
          style={{
            position: "absolute",
            width: 22,
            height: 180,
            left: -21,
            top: 0,
            background: `linear-gradient(to right, ${palette.spine}cc, ${palette.spine})`,
            transform: "rotateY(-90deg)",
            transformOrigin: "right center",
            borderRadius: "3px 0 0 3px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              transform: "rotate(180deg)",
              fontSize: 8,
              fontWeight: 700,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "1px",
              fontFamily: "'Georgia', serif",
              maxHeight: 140,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {book.title}
          </div>
        </div>

        {/* ── Page block (right side) ── */}
        <div
          style={{
            position: "absolute",
            width: 14,
            height: 176,
            right: -13,
            top: 2,
            background:
              "linear-gradient(to right, #e2e8f0, #f8fafc 60%, #e9eef5)",
            transform: "rotateY(90deg)",
            transformOrigin: "left center",
            borderRadius: "0 3px 3px 0",
          }}
        >
          {/* Page lines */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: i * 17 + 5,
                left: 2,
                right: 2,
                height: 1,
                background: "rgba(0,0,0,0.06)",
              }}
            />
          ))}
        </div>

        {/* ── Bottom edge ── */}
        <div
          style={{
            position: "absolute",
            width: 130,
            height: 14,
            bottom: -13,
            left: 0,
            background: "linear-gradient(to bottom, #e2e8f0, #f8fafc)",
            transform: "rotateX(-90deg)",
            transformOrigin: "top center",
          }}
        />
      </div>
    </div>
  );
}

/* ─── BookCard ─────────────────────────────────────────────────────────────── */
export function BookCard({ book, onBorrow }) {
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: hovered
          ? "0 16px 40px rgba(0,0,0,0.14)"
          : "0 2px 14px rgba(0,0,0,0.07)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        fontFamily: "'Georgia', serif",
        cursor: "default",
      }}
    >
      {/* Book display area */}
      <div
        style={{
          height: 230,
          background: "linear-gradient(135deg, #f0f4f8 0%, #e8edf3 100%)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Subtle shelf line */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: "15%",
            right: "15%",
            height: 2,
            background:
              "linear-gradient(to right, transparent, rgba(0,0,0,0.10), transparent)",
            borderRadius: 2,
          }}
        />
        <Book3D book={book} hovered={hovered} />
      </div>

      {/* Info */}
      <div style={{ padding: "16px 18px 18px" }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "#0d9488",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: 5,
            fontFamily: "'Georgia', serif",
          }}
        >
          {book.genre}
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#1e293b",
            marginBottom: 3,
            lineHeight: 1.35,
            fontFamily: "'Georgia', serif",
          }}
        >
          {book.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#64748b",
            marginBottom: 16,
            fontStyle: "italic",
            fontFamily: "'Georgia', serif",
          }}
        >
          {book.author}
        </div>

        <button
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          onClick={() => onBorrow?.(book)}
          style={{
            width: "100%",
            background: btnHovered
              ? "linear-gradient(135deg, #0d9488, #0891b2)"
              : "#fff",
            color: btnHovered ? "#fff" : "#0d9488",
            border: `1.5px solid ${btnHovered ? "transparent" : "#e2e8f0"}`,
            borderRadius: 10,
            padding: "10px 0",
            fontWeight: 700,
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            letterSpacing: "1.5px",
            transform: btnHovered ? "translateY(-1px)" : "translateY(0)",
            transition: "all 0.2s ease",
            fontFamily: "'Georgia', serif",
            boxShadow: btnHovered
              ? "0 4px 14px rgba(13,148,136,0.35)"
              : "none",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          READ NOW
        </button>
      </div>
    </div>
  );
}

/* ─── PDF Modal ────────────────────────────────────────────────────────────── */
function PdfModal({ book, onClose }) {
  if (!book) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 18,
          width: "min(90vw, 900px)",
          height: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "#1e293b",
                fontFamily: "'Georgia', serif",
              }}
            >
              {book.title}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#64748b",
                fontStyle: "italic",
                fontFamily: "'Georgia', serif",
              }}
            >
              {book.author}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: 8,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 13,
              color: "#475569",
              fontFamily: "'Georgia', serif",
            }}
          >
            Close
          </button>
        </div>

        {book.pdfUrl ? (
          <iframe
            src={book.pdfUrl}
            title={book.title}
            style={{ flex: 1, border: "none" }}
          />
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: 15,
              fontFamily: "'Georgia', serif",
            }}
          >
            No PDF available for this book.
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Default export ───────────────────────────────────────────────────────── */
export default function BookCards() {
  const { books, isLoadingList, error } = useBookStore();
  const [activeBook, setActiveBook] = useState(null);

  const cardBooks = books.map((b, i) => ({
    id: b.b_id,
    title: b.b_name || "Untitled",
    author: b.b_author || "Unknown",
    genre: b.b_category || "General",
    pdfUrl: b.b_pdfUrl,
    imageUrl: b.b_imageUrl,
  }));

  if (isLoadingList)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px 0",
          color: "#94a3b8",
          fontFamily: "'Georgia', serif",
        }}
      >
        Loading books…
      </div>
    );

  if (error)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px 0",
          color: "#e11d48",
          fontFamily: "'Georgia', serif",
        }}
      >
        {error}
      </div>
    );

  if (cardBooks.length === 0)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px 0",
          color: "#94a3b8",
          fontFamily: "'Georgia', serif",
        }}
      >
        No books found.
      </div>
    );

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 28,
        }}
      >
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