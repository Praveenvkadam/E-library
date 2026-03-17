"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import LeftSidebar from "@/components/Read_Components/LeftSidebar";
import BookContent from "@/components/Read_Components/BookContent";
import RightToolbar from "@/components/Read_Components/RightToolbar";
import useBookStore from "@/store/usebookstore";
import { getBookPdfUrl } from "@/lib/bookapi";

export default function ReadPage() {
  const { activeReadBook } = useBookStore();

  const [activeChapter, setActiveChapter] = useState(3);
  const [fontSize, setFontSize]           = useState(16);
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  const handleZoomIn  = () => setFontSize((f) => Math.min(f + 2, 28));
  const handleZoomOut = () => setFontSize((f) => Math.max(f - 2, 12));

  const handleChapterSelect = (id) => {
    setActiveChapter(id);
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (!sidebarOpen) return;
    const handler = (e) => {
      if (
        e.target.closest("[data-sidebar]") ||
        e.target.closest("[data-sidebar-toggle]")
      ) return;
      setSidebarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [sidebarOpen]);

  // ── PDF mode ───────────────────────────────────────────────────────────────
  // Uses the backend proxy URL (/api/books/{id}/pdf) instead of the raw
  // Cloudinary URL. The backend fetches the file server-side and returns it
  // with Content-Disposition: inline — browser renders, never downloads.
  if (activeReadBook?.id) {
    const proxyUrl = getBookPdfUrl(activeReadBook.id);

    return (
      <>
        <Head>
          <title>{activeReadBook.title} — Reader</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f2f3f5" }}>

          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px",
            borderBottom: "1px solid #e2e8f0",
            background: "#ffffff",
            flexShrink: 0,
          }}>
            <div>
              <div style={{
                fontWeight: 700, fontSize: 15, color: "#1e293b",
                fontFamily: "'Georgia', serif",
              }}>
                {activeReadBook.title}
              </div>
              <div style={{
                fontSize: 12, color: "#64748b", fontStyle: "italic",
                fontFamily: "'Georgia', serif",
              }}>
                {activeReadBook.author}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleZoomOut} style={zoomBtnStyle} title="Zoom out">A−</button>
              <button onClick={handleZoomIn}  style={zoomBtnStyle} title="Zoom in">A+</button>
            </div>
          </div>

          {/* PDF iframe — src points to backend proxy, always renders inline */}
          <iframe
            src={proxyUrl}
            title={activeReadBook.title}
            style={{ flex: 1, border: "none", width: "100%", display: "block" }}
          />
        </div>
      </>
    );
  }

  // ── Default chapter-based reader ───────────────────────────────────────────
  return (
    <>
      <Head>
        <title>The Midnight Library — Reader</title>
        <meta name="description" content="E-reader for The Midnight Library by Matt Haig" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f2f3f5" }}>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            style={{ backgroundColor: "rgba(13,27,42,0.45)", backdropFilter: "blur(2px)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          data-sidebar
          className={`
            fixed top-0 left-0 z-40 h-full shadow-2xl
            transition-transform duration-300 ease-in-out
            lg:static lg:shadow-none lg:translate-x-0 lg:z-auto lg:flex-shrink-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <LeftSidebar
            onChapterSelect={handleChapterSelect}
            activeChapter={activeChapter}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        <BookContent
          activeChapter={activeChapter}
          fontSize={fontSize}
          onMenuOpen={() => setSidebarOpen(true)}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />

        <div className="hidden lg:flex">
          <RightToolbar onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
        </div>
      </div>
    </>
  );
}

const zoomBtnStyle = {
  background: "#f1f5f9",
  border: "none",
  borderRadius: 8,
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
  color: "#475569",
  fontFamily: "'Georgia', serif",
};