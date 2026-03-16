"use client";

import { X, Star } from "lucide-react";
import { useState } from "react";

const allHistory = [
  {
    id: 1,
    title: "Atomic Habits",
    finished: "Oct 12, 2023",
    rating: 5.0,
    cover: "https://covers.openlibrary.org/b/id/10522304-M.jpg",
    color: "from-slate-400 to-slate-600",
  },
  {
    id: 2,
    title: "The Alchemist",
    finished: "Sep 28, 2023",
    rating: 4.3,
    cover: "https://covers.openlibrary.org/b/id/8739161-M.jpg",
    color: "from-amber-500 to-amber-700",
  },
  {
    id: 3,
    title: "Sapiens: A Brief History of Humankind",
    finished: "Sep 15, 2023",
    rating: 4.4,
    cover: "https://covers.openlibrary.org/b/id/8739165-M.jpg",
    color: "from-blue-400 to-blue-700",
  },
  {
    id: 4,
    title: "Thinking, Fast and Slow",
    finished: "Aug 30, 2023",
    rating: 4.7,
    cover: "https://covers.openlibrary.org/b/id/7857510-M.jpg",
    color: "from-purple-400 to-purple-700",
  },
  {
    id: 5,
    title: "The Power of Now",
    finished: "Aug 10, 2023",
    rating: 4.1,
    cover: "https://covers.openlibrary.org/b/id/8091016-M.jpg",
    color: "from-green-400 to-green-700",
  },
];

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={11}
          className={
            i < full
              ? "fill-cyan-400 text-cyan-400"
              : i === full && hasHalf
              ? "fill-cyan-200 text-cyan-400"
              : "text-gray-200 fill-gray-200"
          }
        />
      ))}
      <span className="text-xs text-gray-500 ml-1 font-semibold">{rating.toFixed(1)}</span>
    </div>
  );
}

function HistoryItem({ book, onRemove }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors group">
      {/* Cover Thumbnail */}
      <div className="w-12 h-16 rounded-lg overflow-hidden shadow-sm shrink-0">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "block";
          }}
        />
        <div
          className={`hidden w-full h-full bg-gradient-to-b ${book.color} rounded-lg`}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm font-serif truncate leading-snug">
          {book.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">Finished on {book.finished}</p>
        <div className="mt-1">
          <StarRating rating={book.rating} />
        </div>
      </div>

      {/* Badge + Remove */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-sm">
          Read
        </span>
        <button
          onClick={() => onRemove(book.id)}
          className="text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export default function ReadingHistory() {
  const [showAll, setShowAll] = useState(false);
  const [items, setItems] = useState(allHistory);

  const displayed = showAll ? items : items.slice(0, 3);

  const handleRemove = (id) => {
    setItems((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🕐</span>
        <h2 className="text-lg font-bold text-gray-800 font-serif">Reading History</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
        {displayed.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No history yet.</p>
        ) : (
          displayed.map((book) => (
            <HistoryItem key={book.id} book={book} onRemove={handleRemove} />
          ))
        )}

        {items.length > 3 && (
          <div className="px-4 py-3 text-center">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              {showAll ? "Show Less" : "Show More History"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}