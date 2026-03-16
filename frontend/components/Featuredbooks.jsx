"use client";

import { useEffect } from "react";
import useBookStore from "@/store/usebookstore";
import { BookCard } from "./BookCard";

const COVER_PAIRS = [
  { bg: "#134e4a", cover: "#0f766e" },
  { bg: "#0c4a6e", cover: "#0369a1" },
  { bg: "#431407", cover: "#7c2d12" },
  { bg: "#14532d", cover: "#166534" },
  { bg: "#1a0a2e", cover: "#4a1d6e" },
  { bg: "#2d1200", cover: "#7c3500" },
];

export default function FeaturedBooks({ activeCategory, onBorrow }) {
  const { books, isLoadingList, error, loadAll } = useBookStore();

  // Filter books by the active category (case-insensitive), "ALL" shows everything
  const filtered =
    !activeCategory || activeCategory.toUpperCase() === "ALL"
      ? books
      : books.filter(
          (b) =>
            (b.b_category || "").toLowerCase() === activeCategory.toLowerCase()
        );

  const cardBooks = filtered.map((b, i) => ({
    id:       b.b_id,
    title:    b.b_name     || "Untitled",
    author:   b.b_author   || "Unknown",
    genre:    b.b_category || "General",
    pdfUrl:   b.b_pdfUrl,
    imageUrl: b.b_imageUrl,
    ...COVER_PAIRS[i % COVER_PAIRS.length],
  }));

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .featured-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1023px) { .featured-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 479px)  { .featured-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#1e293b" }}>Featured Books</span>
        <span style={{ color: "#0d9488", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>View All</span>
      </div>

      {/* ✅ Show all three states clearly */}
      {isLoadingList ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          Loading books…
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#e11d48", fontSize: 14 }}>
          ⚠️ {error} — check Spring Boot is running on port 8081
        </div>
      ) : cardBooks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          No books available.
        </div>
      ) : (
        <div className="featured-grid">
          {cardBooks.map((book) => (
            <BookCard key={book.id} book={book} onBorrow={onBorrow} />
          ))}
        </div>
      )}
    </div>
  );
}