import { useState } from "react";
import {
  ArrowLeft,
  Type,
  Search,
  Bookmark,
  MoreVertical,
  Lock,
  X,
} from "lucide-react";

const chapters = [
  { num: "I", title: "A Conversation", id: 1 },
  { num: "II", title: "The String Theory", id: 2 },
  { num: "III", title: "The Library Between Life", id: 3 },
  { num: "IV", title: "The Librarian", id: 4 },
  { num: "V", title: "The Shelf of Regrets", id: 5 },
];

export default function LeftSidebar({ onChapterSelect, activeChapter, onClose }) {
  const [bookmarked, setBookmarked] = useState(true);
  const progress = 42;

  return (
    <aside
      className="flex flex-col h-full bg-white border-r"
      style={{ borderColor: "#e4e8ed", width: "280px", minWidth: "280px" }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "#e4e8ed" }}>
        <div className="flex items-center gap-3 mb-4">
          {/* Close button — mobile only */}
          <button
            suppressHydrationWarning
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
            aria-label="Close sidebar"
          >
            <X size={18} strokeWidth={2} />
          </button>
          {/* Back arrow — desktop only */}
          <button
            suppressHydrationWarning
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
            aria-label="Go back"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>

          <div className="leading-tight">
            <p
              className="font-semibold text-sm"
              style={{ color: "#0d1b2a", fontFamily: "'DM Sans', sans-serif" }}
            >
              The Midnight Library
            </p>
            <p
              className="text-xs text-gray-400 mt-0.5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Matt Haig
            </p>
          </div>
        </div>

        {/* Toolbar icons */}
        <div className="flex items-center gap-1">
          <ToolbarBtn icon={<Type size={15} strokeWidth={2} />} label="Font settings" />
          <ToolbarBtn icon={<Search size={15} strokeWidth={2} />} label="Search" />
          <ToolbarBtn
            icon={
              <Bookmark
                size={15}
                strokeWidth={bookmarked ? 0 : 2}
                fill={bookmarked ? "#0d7373" : "none"}
              />
            }
            label="Bookmark"
            active={bookmarked}
            onClick={() => setBookmarked((v) => !v)}
          />
          <ToolbarBtn
            icon={<MoreVertical size={15} strokeWidth={2} />}
            label="More options"
          />
        </div>
      </div>

      {/* Table of Contents */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
        <p
          className="text-xs font-semibold tracking-widest mb-3 px-1"
          style={{ color: "#9aa3ad", letterSpacing: "0.12em" }}
        >
          TABLE OF CONTENTS
        </p>

        {/* Progress */}
        <div className="mb-5 px-1">
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="flex items-center justify-center w-4 h-4 rounded-sm text-white"
              style={{ backgroundColor: "#0d7373" }}
            >
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <rect x="0.5" y="0.5" width="3.5" height="3.5" fill="white" rx="0.5" />
                <rect x="5" y="0.5" width="3.5" height="3.5" fill="white" rx="0.5" />
                <rect x="0.5" y="5" width="3.5" height="3.5" fill="white" rx="0.5" />
                <rect x="5" y="5" width="3.5" height="3.5" fill="white" rx="0.5" opacity="0.4" />
              </svg>
            </div>
            <span className="text-xs font-medium" style={{ color: "#0d7373" }}>
              {progress}% Completed
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full progress-fill"
              style={{ width: `${progress}%`, backgroundColor: "#0d7373" }}
            />
          </div>
        </div>

        {/* Chapter list */}
        <nav className="space-y-0.5">
          {chapters.map((ch) => {
            const isActive = ch.id === (activeChapter || 3);
            return (
              <button
                suppressHydrationWarning
                key={ch.id}
                onClick={() => onChapterSelect && onChapterSelect(ch.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                  isActive
                    ? "border-l-2 rounded-l-none"
                    : "hover:bg-gray-50 border-l-2 border-transparent"
                }`}
                style={
                  isActive
                    ? { backgroundColor: "#edf7f7", borderColor: "#0d7373", borderLeftWidth: "2px" }
                    : {}
                }
              >
                <span
                  className="text-xs font-semibold w-6 shrink-0"
                  style={{ color: isActive ? "#0d7373" : "#b0bac4" }}
                >
                  {ch.num}
                </span>
                <span
                  className="text-sm leading-tight"
                  style={{
                    color: isActive ? "#0d1b2a" : "#6b7280",
                    fontWeight: isActive ? "600" : "400",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {ch.title}
                </span>
              </button>
            );
          })}

          {/* Locked content */}
          <div className="flex items-center gap-3 px-3 py-2.5 opacity-40 cursor-not-allowed select-none">
            <Lock size={13} className="ml-0.5 shrink-0" style={{ color: "#9aa3ad" }} />
            <span
              className="text-sm"
              style={{ color: "#9aa3ad", fontFamily: "'DM Sans', sans-serif" }}
            >
              Locked Content
            </span>
          </div>
        </nav>
      </div>
    </aside>
  );
}

function ToolbarBtn({ icon, label, active, onClick }) {
  return (
    <button
      suppressHydrationWarning
      onClick={onClick}
      aria-label={label}
      className={`has-tooltip relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150 ${
        active
          ? "text-white shadow-sm"
          : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
      }`}
      style={active ? { backgroundColor: "#0d7373" } : {}}
    >
      {icon}
      <span
        className="tooltip-text absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap z-50"
        style={{ backgroundColor: "#0d1b2a" }}
      >
        {label}
      </span>
    </button>
  );
}