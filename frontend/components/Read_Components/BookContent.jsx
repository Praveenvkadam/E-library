import { useEffect, useRef } from "react";
import { Menu, ZoomIn, ZoomOut, Sun, Bookmark, MoreHorizontal } from "lucide-react";

export default function BookContent({ chapterNum, title, content = [], page, totalPages, fontSize = 16, onMenuOpen, onZoomIn, onZoomOut }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;
    contentRef.current.style.opacity = 0;
    contentRef.current.style.transform = "translateY(6px)";
    requestAnimationFrame(() => {
      contentRef.current.style.transition = "opacity 0.35s ease, transform 0.35s ease";
      contentRef.current.style.opacity = 1;
      contentRef.current.style.transform = "translateY(0)";
    });
  }, [chapterNum]);

  return (
    <main className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "#f2f3f5", minWidth: 0 }}>

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-white" style={{ borderColor: "#e4e8ed" }}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            suppressHydrationWarning
            data-sidebar-toggle
            onClick={onMenuOpen}
            className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} style={{ color: "#0d1b2a" }} strokeWidth={2} />
          </button>
          <div className="min-w-0 leading-tight">
            <p className="font-semibold text-sm truncate" style={{ color: "#0d1b2a", fontFamily: "'DM Sans', sans-serif" }}>
              The Midnight Library
            </p>
            <p className="text-xs text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {chapterNum}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <TopBtn onClick={onZoomOut} label="Zoom out"><ZoomOut size={17} strokeWidth={2} /></TopBtn>
          <TopBtn onClick={onZoomIn}  label="Zoom in" ><ZoomIn  size={17} strokeWidth={2} /></TopBtn>
          <TopBtn label="More"><MoreHorizontal size={17} strokeWidth={2} /></TopBtn>
        </div>
      </div>

      {/* Reading area */}
      <div className="flex-1 overflow-y-auto">
        <div ref={contentRef} className="max-w-2xl mx-auto px-5 sm:px-8 md:px-10 lg:px-12 py-8 lg:py-12">

          <p className="text-center text-xs font-bold mb-6" style={{ color: "#0d7373", letterSpacing: "0.2em", fontFamily: "'DM Sans', sans-serif" }}>
            {chapterNum}
          </p>

          <Divider />

          <h1
            className="text-center font-bold leading-tight mb-10"
            style={{ fontFamily: "'Playfair Display', serif", color: "#0d1b2a", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", whiteSpace: "pre-line" }}
          >
            {title}
          </h1>

          <Divider />

          <div className="space-y-6 mt-10">
            {content.map((block, idx) => {
              if (block.type === "drop-cap") return (
                <p key={idx} style={{ fontFamily: "'Lora', serif", fontSize: `${fontSize}px`, color: "#2d3748", lineHeight: "1.85" }}>
                  <span style={{ float: "left", fontFamily: "'Playfair Display', serif", fontSize: "4.5rem", fontWeight: 900, lineHeight: "0.82", marginRight: "0.1em", marginTop: "0.06em", color: "#0d1b2a" }}>
                    {block.text[0].toUpperCase()}
                  </span>
                  {block.text.slice(1)}
                </p>
              );
              if (block.type === "paragraph") return (
                <p key={idx} style={{ fontFamily: "'Lora', serif", fontSize: `${fontSize}px`, color: "#2d3748", lineHeight: "1.85" }}>
                  {block.text}
                </p>
              );
              if (block.type === "blockquote") return (
                <blockquote
                  key={idx}
                  className="my-8 px-5 py-4 sm:px-6 sm:py-5 rounded-r-lg border-l-4"
                  style={{ borderColor: "#0d7373", backgroundColor: "#edf7f7", fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: `${fontSize + 1}px`, color: "#2d3748", lineHeight: "1.75" }}
                >
                  {block.text}
                </blockquote>
              );
              return null;
            })}
          </div>
        </div>
      </div>

      {/* Page footer */}
      <div
        className="flex items-center justify-between px-5 sm:px-8 lg:px-12 py-3 border-t"
        style={{ backgroundColor: "#f2f3f5", borderColor: "#dde2e8" }}
      >
        <span className="text-xs font-medium" style={{ color: "#9aa3ad", letterSpacing: "0.1em" }}>
          PAGE {page} OF {totalPages}
        </span>
        <button
          suppressHydrationWarning
          className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors"
          style={{ backgroundColor: "#e4e8ed", color: "#9aa3ad" }}
        >
          i
        </button>
      </div>

      {/* Mobile bottom toolbar */}
      <div
        className="lg:hidden flex items-center justify-around px-2 py-2 border-t bg-white"
        style={{ borderColor: "#e4e8ed", paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <BottomBtn label="Contents" onClick={onMenuOpen}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="4"    width="14" height="1.5" rx="0.75" fill="currentColor" />
            <rect x="3" y="9.25" width="10" height="1.5" rx="0.75" fill="currentColor" />
            <rect x="3" y="14.5" width="12" height="1.5" rx="0.75" fill="currentColor" />
          </svg>
        </BottomBtn>
        <BottomBtn label="Zoom out"   onClick={onZoomOut}><ZoomOut   size={20} strokeWidth={2} /></BottomBtn>
        <BottomBtn label="Zoom in"    onClick={onZoomIn} ><ZoomIn    size={20} strokeWidth={2} /></BottomBtn>
        <BottomBtn label="Brightness"                    ><Sun       size={20} strokeWidth={2} /></BottomBtn>
        <BottomBtn label="Bookmark"                      ><Bookmark  size={20} strokeWidth={2} /></BottomBtn>
      </div>
    </main>
  );
}

function Divider() {
  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <div className="h-px flex-1 max-w-[80px]" style={{ backgroundColor: "#ccd4dc" }} />
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="opacity-30">
        <path d="M9 2v14M2 9h14" stroke="#0d1b2a" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="9" r="2" fill="#0d1b2a" />
      </svg>
      <div className="h-px flex-1 max-w-[80px]" style={{ backgroundColor: "#ccd4dc" }} />
    </div>
  );
}

function TopBtn({ onClick, label, children }) {
  return (
    <button suppressHydrationWarning onClick={onClick} aria-label={label} className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "#5a6474" }}>
      {children}
    </button>
  );
}

function BottomBtn({ onClick, label, children }) {
  return (
    <button suppressHydrationWarning onClick={onClick} aria-label={label} className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors" style={{ color: "#5a6474" }}>
      {children}
      <span className="text-[10px] font-medium" style={{ color: "#9aa3ad", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
    </button>
  );
}