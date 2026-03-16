"use client";

import { useEffect, useState, useCallback } from "react";
import useBookStore from "@/store/bookstore";   // adjust path if needed
import BookCard from "@/components/BookCard";      // adjust path if needed

// ─── colour palette cycling for generated covers ────────────────────────────
const COVER_PAIRS = [
  { bg: "#0f172a", cover: "#1e3a5f" },
  { bg: "#1a0a2e", cover: "#4a1d6e" },
  { bg: "#0d2b1a", cover: "#145a32" },
  { bg: "#2d1200", cover: "#7c3500" },
  { bg: "#1a1a2e", cover: "#16213e" },
  { bg: "#2c0a0a", cover: "#7b1212" },
];

function toCardShape(storeBook, index) {
  const palette = COVER_PAIRS[index % COVER_PAIRS.length];
  return {
    _raw:   storeBook,                          // keep original for actions
    id:     storeBook.b_id,
    title:  storeBook.b_name   || "Untitled",
    author: storeBook.b_author || "Unknown",
    genre:  storeBook.b_category || "General",
    bg:     palette.bg,
    cover:  palette.cover,
    pdfUrl: storeBook.b_pdfUrl,
  };
}

// ─── Search bar ─────────────────────────────────────────────────────────────
function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("");

  function handleKey(e) {
    if (e.key === "Enter") onSearch(query.trim());
  }

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Search by title, author, category…"
        style={{
          flex: 1,
          padding: "10px 16px",
          borderRadius: 10,
          border: "1.5px solid #e2e8f0",
          fontSize: 14,
          fontFamily: "'Inter', sans-serif",
          outline: "none",
          color: "#1e293b",
        }}
      />
      <button
        onClick={() => onSearch(query.trim())}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: "#0d9488",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 13,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {loading ? "…" : "Search"}
      </button>
      {query && (
        <button
          onClick={() => { setQuery(""); onSearch(""); }}
          style={{
            padding: "10px 14px",
            background: "#f1f5f9",
            color: "#64748b",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}

// ─── Toast ──────────────────────────────────────────────────────────────────
function Toast({ msg, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [msg, onClose]);

  const colors = {
    info:    { bg: "#f0fdfa", border: "#0d9488", text: "#0d9488" },
    error:   { bg: "#fff1f2", border: "#e11d48", text: "#e11d48" },
    success: { bg: "#f0fdf4", border: "#16a34a", text: "#16a34a" },
  };
  const c = colors[type] || colors.info;

  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 999,
      background: c.bg, border: `1.5px solid ${c.border}`,
      color: c.text, borderRadius: 12,
      padding: "12px 20px", fontSize: 14, fontWeight: 600,
      boxShadow: "0 4px 20px rgba(0,0,0,.1)",
      fontFamily: "'Inter', sans-serif",
      maxWidth: 340,
    }}>
      {msg}
    </div>
  );
}

// ─── PDF Viewer Modal ────────────────────────────────────────────────────────
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
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,.3)",
        }}
      >
        {/* Header */}
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
        {/* PDF iframe */}
        {book.pdfUrl ? (
          <iframe
            src={book.pdfUrl}
            title={book.title}
            style={{ flex: 1, border: "none" }}
          />
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

// ─── Main Catalog ────────────────────────────────────────────────────────────
export default function BookCatalog() {
  const { books, isLoadingList, error, successMsg, loadAll, search, clearMessages } =
    useBookStore();

  const [activeBook, setActiveBook] = useState(null);   // for PDF modal
  const [toast,      setToast]      = useState(null);

  // load on mount
  useEffect(() => { loadAll(); }, [loadAll]);

  // surface store messages as toasts
  useEffect(() => {
    if (successMsg) { setToast({ msg: successMsg, type: "success" }); clearMessages(); }
    if (error)      { setToast({ msg: error,      type: "error"   }); clearMessages(); }
  }, [successMsg, error, clearMessages]);

  const handleSearch = useCallback((query) => {
    if (!query) { loadAll(); return; }
    search({ B_name: query, B_author: query, B_Category: query });
  }, [loadAll, search]);

  const handleBorrow = useCallback((cardBook) => {
    setActiveBook(cardBook);
  }, []);

  const cardBooks = books.map((b, i) => toCardShape(b, i));

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      padding: "40px 24px",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto 32px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", margin: 0 }}>
          Library
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
          {books.length} book{books.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Search */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SearchBar onSearch={handleSearch} loading={isLoadingList} />
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {isLoadingList ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "80px 0", fontSize: 15 }}>
            Loading books…
          </div>
        ) : cardBooks.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "80px 0", fontSize: 15 }}>
            No books found.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
            gap: 24,
          }}>
            {cardBooks.map((book) => (
              <BookCard key={book.id} book={book} onBorrow={handleBorrow} />
            ))}
          </div>
        )}
      </div>

      {/* PDF Modal */}
      {activeBook && (
        <PdfModal book={activeBook} onClose={() => setActiveBook(null)} />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}