"use client";
import BookCard from "./BookCard";

// ── Sample data — replace with your API / props ───────────────────────────────
const DEFAULT_BOOKS = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "LITERATURE",
    badge: "BESTSELLER",
    badgeColor: "#f97316",
    bg: "#134e4a",
    cover: "#0f766e",
  },
  {
    id: 2,
    title: "Astrophysics Basics",
    author: "Neil deGrasse Tyson",
    genre: "SCIENCE",
    badge: null,
    bg: "#0c4a6e",
    cover: "#0369a1",
  },
  {
    id: 3,
    title: "Silent Witness",
    author: "Rebecca Thorne",
    genre: "MYSTERY",
    badge: "NEW",
    badgeColor: "#0d9488",
    bg: "#431407",
    cover: "#7c2d12",
  },
  {
    id: 4,
    title: "Wild Safari",
    author: "David Attenborough",
    genre: "KIDS",
    badge: null,
    bg: "#14532d",
    cover: "#166534",
  },
];

export default function FeaturedBooks({ books = DEFAULT_BOOKS, onBorrow }) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .featured-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1023px) {
          .featured-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 479px) {
          .featured-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 20,
      }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#1e293b" }}>
          Featured Books
        </span>
        <span style={{ color: "#0d9488", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          View All
        </span>
      </div>

      {/* ── Grid ── */}
      <div className="featured-grid">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onBorrow={onBorrow} />
        ))}
      </div>
    </div>
  );
}