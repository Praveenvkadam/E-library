"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Head         from "next/head";
import LeftSidebar  from "@/components/Read_Components/LeftSidebar";
import BookContent  from "@/components/Read_Components/BookContent";
import RightToolbar from "@/components/Read_Components/RightToolbar";
import SummaryPanel from "@/components/Read_Components/Summarypanel";
import TTSPlayer    from "@/components/Read_Components/Ttsplayer";
import useBookStore from "@/store/usebookstore";
import { getBookPdfUrl } from "@/lib/bookapi";
import { Sparkles, Mic, Loader2 } from "lucide-react";

// ── Chapter data ──────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    id: 1, num: "Chapter I", title: "A Conversation",
    content: [
      { type: "drop-cap", text: "Nora Seed had decided that she was going to do it tonight. The last act. The final one. She had rehearsed the decision all day, and felt quite calm about it now." },
      { type: "paragraph", text: "The day had started badly. She had lost her job at the String Theory music shop on Bancroft Avenue, where she had worked for seven years. The shop had been on the brink of failing for a long time, but today the owner had finally delivered the news she'd been dreading." },
      { type: "blockquote", text: "Between life and death there is a library, and within that library, the shelves go on forever." },
    ],
  },
  {
    id: 2, num: "Chapter II", title: "The String Theory",
    content: [
      { type: "drop-cap", text: "The music shop had been her anchor. Seven years of early mornings sorting vinyl, afternoons helping customers choose instruments, evenings locking up as the streetlights flickered on." },
      { type: "paragraph", text: "She had loved the smell of it — the mixture of rosin, guitar polish, and old cardboard. She had loved the customers who understood that music was not just sound but a kind of parallel life, a universe of feeling." },
    ],
  },
  {
    id: 3, num: "Chapter III", title: "The Library Between Life",
    content: [
      { type: "drop-cap", text: "The library materialised slowly, like a photograph developing in a darkroom. She became aware of the green shaded reading lamps first, then the long oak tables, then the infinite shelves rising on all sides into a darkness that had no ceiling." },
      { type: "paragraph", text: "The books themselves were unlike any she had seen. Their spines were a deep, forest green, each one labelled in gold ink with a date rather than a title. The dates corresponded, she understood instinctively, to moments: forks in the road, decisions unmade, words unsaid." },
      { type: "blockquote", text: "It is not the life you have lived but the life you could have lived — that is what waits here, on every shelf." },
      { type: "paragraph", text: "She walked slowly between the aisles, trailing her fingers along the cool leather spines. Each touch sent a faint vibration up her arm, as though the books were breathing." },
    ],
  },
  {
    id: 4, num: "Chapter IV", title: "The Librarian",
    content: [
      { type: "drop-cap", text: "Mrs Elm appeared from behind a particularly tall shelf, moving with the unhurried certainty of someone who had been waiting a very long time and had decided the wait was worth it." },
      { type: "paragraph", text: "She looked exactly as Nora remembered her from school — the same silvered hair, the same reading glasses, the same cardigan the colour of autumn leaves — though she radiated a stillness that the real Mrs Elm had never quite possessed." },
    ],
  },
  {
    id: 5, num: "Chapter V", title: "The Shelf of Regrets",
    content: [
      { type: "drop-cap", text: "The Shelf of Regrets occupied an entire wall near the entrance — or what Nora had come to think of as the entrance, though the library had no obvious door." },
      { type: "paragraph", text: "The books here had a different quality to the rest. They were heavier, their spines slightly bowed as though the weight of their contents had bent them over years of waiting." },
      { type: "blockquote", text: "You don't have to understand life. You just have to live it." },
    ],
  },
];

function flattenContent(blocks = []) {
  return blocks.map((b) => b.text).join("\n\n");
}

const baseBtnStyle = {
  border:       "1px solid transparent",
  borderRadius: 8,
  padding:      "6px 12px",
  cursor:       "pointer",
  fontSize:     12,
  fontWeight:   700,
  fontFamily:   "'Georgia', serif",
  display:      "flex",
  alignItems:   "center",
  gap:          5,
  transition:   "background 0.15s, color 0.15s, border-color 0.15s",
};

// ─────────────────────────────────────────────────────────────────────────────
export default function ReadPage() {
  const { activeReadBook } = useBookStore();
  const isPdfMode = Boolean(activeReadBook?.id);

  const [activeChapter,    setActiveChapter]    = useState(3);
  const [fontSize,         setFontSize]         = useState(16);
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [summaryOpen,      setSummaryOpen]      = useState(false);
  const [ttsActive,        setTtsActive]        = useState(false);

  // PDF TTS: extracted text + loading/error state
  const [pdfTtsText,       setPdfTtsText]       = useState("");
  const [pdfTtsLoading,    setPdfTtsLoading]    = useState(false);
  const [pdfTtsError,      setPdfTtsError]      = useState("");
  const extractedForUrl    = useRef("");

  const handleZoomIn  = () => setFontSize((f) => Math.min(f + 2, 28));
  const handleZoomOut = () => setFontSize((f) => Math.max(f - 2, 12));

  const handleChapterSelect = (id) => {
    setActiveChapter(id);
    setSidebarOpen(false);
    setTtsActive(false);
  };

  const currentChapter = useMemo(
    () => CHAPTERS.find((ch) => ch.id === activeChapter) ?? CHAPTERS[2],
    [activeChapter]
  );

  const chapterText = useMemo(
    () => flattenContent(currentChapter.content),
    [currentChapter]
  );

  const pdfProxyUrl  = isPdfMode ? getBookPdfUrl(activeReadBook.id) : null;
  const summaryTitle = isPdfMode
    ? activeReadBook.title
    : `${currentChapter.num} · ${currentChapter.title}`;

  // ── Extract PDF text (called once per PDF, cached by URL) ─────────────────
  const extractAndOpenTts = useCallback(async () => {
    // Already extracted for this PDF → just toggle the player
    if (extractedForUrl.current === pdfProxyUrl && pdfTtsText) {
      setTtsActive((v) => !v);
      return;
    }

    setPdfTtsLoading(true);
    setPdfTtsError("");
    setTtsActive(false);

    try {
      const res  = await fetch("/api/ai/tts/extract-pdf-text", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url: pdfProxyUrl }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) throw new Error(json.message || "Extraction failed.");

      setPdfTtsText(json.data.text);
      extractedForUrl.current = pdfProxyUrl;
      setTtsActive(true);
    } catch (err) {
      setPdfTtsError(err.message || "Could not read this PDF.");
    } finally {
      setPdfTtsLoading(false);
    }
  }, [pdfProxyUrl, pdfTtsText]);

  // ── Close sidebar on outside click ───────────────────────────────────────
  useEffect(() => {
    if (!sidebarOpen) return;
    const handler = (e) => {
      if (e.target.closest("[data-sidebar]") || e.target.closest("[data-sidebar-toggle]")) return;
      setSidebarOpen(false);
    };
    document.addEventListener("mousedown",  handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown",  handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [sidebarOpen]);

  // ── Text forwarded to TTSPlayer ───────────────────────────────────────────
  // Chapter mode → chapterText   |   PDF mode → pdfTtsText (filled after extraction)
  const ttsText = isPdfMode ? pdfTtsText : chapterText;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>{isPdfMode ? `${activeReadBook.title} — Reader` : "The Midnight Library — Reader"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isPdfMode ? (
        /* ════════════════════════════ PDF MODE ════════════════════════════ */
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", backgroundColor: "#f2f3f5" }}>

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 20px", borderBottom: "1px solid #e2e8f0",
            background: "#ffffff", flexShrink: 0, gap: 12,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", fontFamily: "'Georgia', serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {activeReadBook.title}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", fontFamily: "'Georgia', serif" }}>
                {activeReadBook.author}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
              <button suppressHydrationWarning onClick={handleZoomOut} style={{ ...baseBtnStyle, background: "#f1f5f9", color: "#475569" }}>A−</button>
              <button suppressHydrationWarning onClick={handleZoomIn}  style={{ ...baseBtnStyle, background: "#f1f5f9", color: "#475569" }}>A+</button>

              <div style={{ width: 1, height: 24, backgroundColor: "#e2e8f0" }} />

              {/* AI Summary */}
              <button suppressHydrationWarning
                onClick={() => setSummaryOpen((v) => !v)}
                style={{
                  ...baseBtnStyle,
                  background:  summaryOpen ? "#edf7f7" : "#f1f5f9",
                  color:       summaryOpen ? "#0d7373" : "#475569",
                  borderColor: summaryOpen ? "#0d7373" : "transparent",
                }}>
                <Sparkles size={13} strokeWidth={2} />
                Summary
              </button>

              {/* Read Aloud — shows spinner while extracting */}
              <button suppressHydrationWarning
                onClick={extractAndOpenTts}
                disabled={pdfTtsLoading}
                style={{
                  ...baseBtnStyle,
                  background:  ttsActive  ? "#fff5f5"  : pdfTtsError ? "#fff5f5" : "#f1f5f9",
                  color:       ttsActive  ? "#ef4444"  : pdfTtsError ? "#ef4444" : "#475569",
                  borderColor: ttsActive  ? "#ef4444"  : pdfTtsError ? "#ef4444" : "transparent",
                  opacity:     pdfTtsLoading ? 0.7 : 1,
                  cursor:      pdfTtsLoading ? "not-allowed" : "pointer",
                }}>
                {pdfTtsLoading
                  ? <Loader2 size={13} strokeWidth={2} className="animate-spin" />
                  : <Mic size={13} strokeWidth={2} />
                }
                {pdfTtsLoading ? "Extracting…" : pdfTtsError ? "Retry" : "Read Aloud"}
              </button>
            </div>
          </div>

          {/* Extraction error banner */}
          {pdfTtsError && !pdfTtsLoading && (
            <div style={{
              padding: "8px 20px", backgroundColor: "#fff5f5",
              borderBottom: "1px solid #fed7d7", fontSize: 12,
              color: "#c53030", fontFamily: "'DM Sans', sans-serif",
            }}>
              ⚠ {pdfTtsError} — the PDF may be image-based or encrypted.
            </div>
          )}

          {/* PDF iframe */}
          <iframe
            src={pdfProxyUrl}
            title={activeReadBook.title}
            style={{ flex: 1, border: "none", width: "100%", display: "block" }}
          />

          {/* Summary Panel */}
          <SummaryPanel
            isOpen={summaryOpen}
            onClose={() => setSummaryOpen(false)}
            pdfUrl={pdfProxyUrl}
            chapterTitle={summaryTitle}
          />

          {/* TTS Player — only mounts when we have real text */}
          <TTSPlayer
            isVisible={ttsActive && Boolean(pdfTtsText)}
            text={pdfTtsText}
            onClose={() => setTtsActive(false)}
          />
        </div>

      ) : (
        /* ═════════════════════════ CHAPTER MODE ═══════════════════════════ */
        <div className="flex overflow-hidden relative"
          style={{ backgroundColor: "#f2f3f5", height: "calc(100vh - 64px)" }}>

          {sidebarOpen && (
            <div className="fixed inset-0 z-30 lg:hidden"
              style={{ backgroundColor: "rgba(13,27,42,0.45)", backdropFilter: "blur(2px)" }}
              onClick={() => setSidebarOpen(false)} />
          )}

          <div data-sidebar className={`
            fixed top-0 left-0 z-40 h-full shadow-2xl
            transition-transform duration-300 ease-in-out
            lg:static lg:shadow-none lg:translate-x-0 lg:z-auto lg:flex-shrink-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}>
            <LeftSidebar
              onChapterSelect={handleChapterSelect}
              activeChapter={activeChapter}
              onClose={() => setSidebarOpen(false)}
            />
          </div>

          <BookContent
            chapterNum={currentChapter.num}
            title={currentChapter.title}
            content={currentChapter.content}
            page={activeChapter}
            totalPages={CHAPTERS.length}
            fontSize={fontSize}
            onMenuOpen={() => setSidebarOpen(true)}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />

          <div className="hidden lg:flex">
            <RightToolbar
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onSummaryToggle={() => setSummaryOpen((v) => !v)}
              onTTSToggle={()     => setTtsActive((v)  => !v)}
              summaryOpen={summaryOpen}
              ttsActive={ttsActive}
            />
          </div>

          <SummaryPanel
            isOpen={summaryOpen}
            onClose={() => setSummaryOpen(false)}
            chapterText={chapterText}
            chapterTitle={summaryTitle}
          />

          <TTSPlayer
            isVisible={ttsActive}
            text={chapterText}
            onClose={() => setTtsActive(false)}
          />
        </div>
      )}
    </>
  );
}