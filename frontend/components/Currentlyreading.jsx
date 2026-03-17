"use client";

import { useRouter } from "next/navigation";
import { X, BookOpen } from "lucide-react";
import useBookStore from "@/store/usebookstore";

const books = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "https://covers.openlibrary.org/b/id/8432472-L.jpg",
    progress: 65,
    color: "from-amber-200 to-amber-400",
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    cover: "https://covers.openlibrary.org/b/id/8575708-L.jpg",
    progress: 20,
    color: "from-green-200 to-green-400",
  },
  {
    id: 3,
    title: "Dune",
    author: "Frank Herbert",
    cover: "https://covers.openlibrary.org/b/id/8758161-L.jpg",
    progress: 90,
    color: "from-orange-200 to-orange-500",
  },
];

function BookCard({ book }) {
  const { setActiveReadBook } = useBookStore();
  const router = useRouter();

  const handleRead = () => {
    setActiveReadBook(book);
    router.push("/Readpage");
  };

  return (
    <div className="min-w-[200px] sm:min-w-[220px] flex-shrink-0 bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-200">
      {/* Cover */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <div
          className={`hidden w-full h-full bg-gradient-to-b ${book.color} items-center justify-center`}
        >
          <BookOpen size={48} className="text-white opacity-60" />
        </div>

        {/* Close button */}
        <button className="absolute top-2 right-2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors">
          <X size={13} className="text-gray-500" />
        </button>

        {/* Progress Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white text-xs font-semibold">{book.progress}% Completed</span>
          </div>
          <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${book.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-bold text-gray-800 text-sm leading-tight font-serif truncate">{book.title}</h3>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{book.author}</p>
        <button
          onClick={handleRead}
          className="mt-3 w-full bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600 text-white text-xs font-bold py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 tracking-wider"
        >
          READ NOW
        </button>
      </div>
    </div>
  );
}

export default function CurrentlyReading() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📖</span>
          <h2 className="text-lg font-bold text-gray-800 font-serif">Currently Reading</h2>
        </div>
        <button className="text-sm font-semibold text-cyan-500 hover:text-cyan-600 transition-colors">
          View All
        </button>
      </div>

      {/* Scrollable Row */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {books.map((book) => (
          <div key={book.id} className="snap-start">
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </section>
  );
}