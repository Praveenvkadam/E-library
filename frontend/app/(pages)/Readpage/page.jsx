"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import LeftSidebar from "@/components/Read_Components/LeftSidebar";
import BookContent from "@/components/Read_Components/BookContent";
import RightToolbar from "@/components/Read_Components/RightToolbar";

export default function ReadPage() {
  const [activeChapter, setActiveChapter] = useState(3);
  const [fontSize, setFontSize] = useState(16);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleZoomIn = () => setFontSize((f) => Math.min(f + 2, 28));
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

  return (
    <>
      <Head>
        <title>The Midnight Library — Reader</title>
        <meta name="description" content="E-reader for The Midnight Library by Matt Haig" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f2f3f5" }}>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            style={{ backgroundColor: "rgba(13,27,42,0.45)", backdropFilter: "blur(2px)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar — desktop: static | mobile/tablet: slide-in drawer */}
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

        {/* Main reading content */}
        <BookContent
          activeChapter={activeChapter}
          fontSize={fontSize}
          onMenuOpen={() => setSidebarOpen(true)}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />

        {/* Right toolbar — desktop only */}
        <div className="hidden lg:flex">
          <RightToolbar onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
        </div>
      </div>
    </>
  );
}