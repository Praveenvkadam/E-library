"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BookOpen, History, Star, X, Flame } from "lucide-react";

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const READING_NOW = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    progress: 65,
    coverUrl: "https://m.media-amazon.com/images/I/71FTb9X6wsL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    progress: 20,
    coverUrl: "https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    id: 3,
    title: "Dune",
    author: "Frank Herbert",
    progress: 90,
    coverUrl: "https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UF1000,1000_QL80_.jpg",
  },
];

const HISTORY = [
  {
    id: 1,
    title: "Atomic Habits",
    subtitle: "Finished on Oct 12, 2023",
    rating: 5.0,
    coverUrl: "https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    id: 2,
    title: "The Alchemist",
    subtitle: "Finished on Sep 28, 2023",
    rating: 4.5,
    coverUrl: "https://m.media-amazon.com/images/I/71aFt4+OTOL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    id: 3,
    title: "Sapiens: A Brief History of Humankind",
    subtitle: "Finished on Sep 15, 2023",
    rating: 4.8,
    coverUrl: "https://m.media-amazon.com/images/I/713jIoMO3UL._AC_UF1000,1000_QL80_.jpg",
  },
];

/* ─────────────────────────────────────────────
   BookCard
───────────────────────────────────────────── */
function BookCard({ title, author, progress, coverUrl }) {
  return (
    <div className="min-w-[200px] flex-shrink-0 sm:flex-shrink sm:min-w-0 rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Cover */}
      <div className="relative h-52 bg-gradient-to-br from-slate-200 to-gray-300">
        <Image src={coverUrl} alt={title} fill className="object-cover" />

        {/* Dismiss */}
        <button className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors">
          <X className="w-3.5 h-3.5 text-gray-600" />
        </button>

        {/* Progress overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-8 pb-2">
          <div className="h-1.5 bg-white/30 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white text-xs font-medium">{progress}% Completed</p>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-sm mb-0.5 truncate">{title}</h3>
        <p className="text-gray-400 text-xs mb-3 truncate">{author}</p>
        <Button className="w-full h-9 text-xs font-bold tracking-wide bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600 text-white border-0 rounded-xl shadow-sm shadow-orange-200">
          READ NOW
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HistoryItem
───────────────────────────────────────────── */
function HistoryItem({ title, subtitle, rating, coverUrl }) {
  return (
    <div className="flex items-center gap-3 py-4 border-b border-gray-50 last:border-0 hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent rounded-xl transition-all duration-200 px-2">
      <div className="relative w-14 h-16 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
        <Image src={coverUrl} alt={title} fill className="object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-800 text-sm truncate">{title}</h4>
        <p className="text-gray-400 text-xs mt-0.5 truncate">{subtitle}</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span className="text-sm font-bold text-gray-700 w-8">{rating}</span>
      </div>

      <Button
        size="sm"
        className="h-8 w-16 text-xs font-bold bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600 text-white border-0 rounded-lg shadow-sm shadow-orange-200 flex-shrink-0"
      >
        Read
      </Button>

      <button className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MainContent (default export)
───────────────────────────────────────────── */
export default function MainContent() {
  return (
    <main className="flex-1 flex flex-col gap-6">

      {/* Currently Reading */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white shadow-xl shadow-gray-100/80 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md shadow-cyan-100">
              <BookOpen className="w-4 h-4 text-white" />
            </span>
            <h2 className="text-xl font-extrabold text-gray-800">Currently Reading</h2>
          </div>
          <button className="text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent hover:opacity-75 transition-opacity">
            View All
          </button>
        </div>

        {/* Horizontal scroll on mobile → 3-col grid on sm+ */}
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible">
          {READING_NOW.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      </div>

      {/* Reading History */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white shadow-xl shadow-gray-100/80 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-md shadow-violet-100">
            <History className="w-4 h-4 text-white" />
          </span>
          <h2 className="text-xl font-extrabold text-gray-800">Reading History</h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-2 divide-y divide-gray-50 overflow-hidden">
          {HISTORY.map((item) => (
            <HistoryItem key={item.id} {...item} />
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <Button variant="ghost" className="text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl px-8">
            Show More History
          </Button>
        </div>
      </div>

    </main>
  );
}