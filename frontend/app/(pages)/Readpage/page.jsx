"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Head              from "next/head";
import SummaryPanel      from "@/components/Read_Components/Summarypanel";
import TTSPlayer         from "@/components/Read_Components/Ttsplayer";
import useBookStore      from "@/store/usebookstore";
import useAIServiceStore from "@/store/useaiservicestore";
import { getBookPdfUrl } from "@/lib/bookapi";
import { Sparkles, Mic, Loader2 } from "lucide-react";
import { getToken } from "@/store/authstore";

const baseBtnStyle = {
  border: "1px solid transparent", borderRadius: 8, padding: "6px 12px",
  cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Georgia', serif",
  display: "flex", alignItems: "center", gap: 5,
  transition: "background 0.15s, color 0.15s, border-color 0.15s",
};

// ─── Authenticated PDF loader ─────────────────────────────────────────────────
function usePdfBlobUrl(pdfProxyUrl) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const prevBlobRef           = useRef(null);

  useEffect(() => {
    if (!pdfProxyUrl) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setBlobUrl(null);

    (async () => {
      try {
        const token = getToken();

        const res = await fetch(pdfProxyUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const url = URL.createObjectURL(await res.blob());

        if (!cancelled) {
          if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
          prevBlobRef.current = url;
          setBlobUrl(url);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (prevBlobRef.current) {
        URL.revokeObjectURL(prevBlobRef.current);
        prevBlobRef.current = null;
      }
    };
  }, [pdfProxyUrl]);

  return { blobUrl, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ReadPage() {
  const { activeReadBook } = useBookStore();
  const { extractPdfText } = useAIServiceStore();

  const [fontSize,      setFontSize]      = useState(16);
  const [summaryOpen,   setSummaryOpen]   = useState(false);
  const [ttsActive,     setTtsActive]     = useState(false);
  const [pdfTtsText,    setPdfTtsText]    = useState("");
  const [pdfTtsLoading, setPdfTtsLoading] = useState(false);
  const [pdfTtsError,   setPdfTtsError]   = useState("");
  const extractedForUrl                   = useRef("");

  const handleZoomIn  = () => setFontSize((f) => Math.min(f + 2, 28));
  const handleZoomOut = () => setFontSize((f) => Math.max(f - 2, 12));

  const pdfProxyUrl  = activeReadBook?.id ? getBookPdfUrl(activeReadBook.id) : null;
  const summaryTitle = activeReadBook?.title ?? "Untitled";

  // ✅ Blob URL — fetched with auth, safe for iframe
  const { blobUrl, loading: pdfLoading, error: pdfError } = usePdfBlobUrl(pdfProxyUrl);

  // ── Extract PDF text for TTS ──────────────────────────────────────────────
  const extractAndOpenTts = useCallback(async () => {
    if (extractedForUrl.current === pdfProxyUrl && pdfTtsText) {
      setTtsActive((v) => !v);
      return;
    }
    setPdfTtsLoading(true);
    setPdfTtsError("");
    setTtsActive(false);
    try {
      const data = await extractPdfText(pdfProxyUrl);
      setPdfTtsText(data.text);
      extractedForUrl.current = pdfProxyUrl;
      setTtsActive(true);
    } catch (err) {
      setPdfTtsError(err.message || "Could not read this PDF.");
    } finally {
      setPdfTtsLoading(false);
    }
  }, [pdfProxyUrl, pdfTtsText, extractPdfText]);

  // ─────────────────────────────────────────────────────────────────────────
  if (!activeReadBook?.id) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "calc(100vh - 64px)", backgroundColor: "#f2f3f5",
        fontFamily: "'Georgia', serif", color: "#64748b", fontSize: 16,
      }}>
        No book selected. Please go back and choose a book to read.
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${activeReadBook.title} — Reader`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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

            <button suppressHydrationWarning
              onClick={() => setSummaryOpen((v) => !v)}
              style={{ ...baseBtnStyle, background: summaryOpen ? "#edf7f7" : "#f1f5f9", color: summaryOpen ? "#0d7373" : "#475569", borderColor: summaryOpen ? "#0d7373" : "transparent" }}>
              <Sparkles size={13} strokeWidth={2} /> Summary
            </button>

            <button suppressHydrationWarning
              onClick={extractAndOpenTts}
              disabled={pdfTtsLoading}
              style={{ ...baseBtnStyle, background: ttsActive ? "#fff5f5" : pdfTtsError ? "#fff5f5" : "#f1f5f9", color: ttsActive ? "#ef4444" : pdfTtsError ? "#ef4444" : "#475569", borderColor: ttsActive ? "#ef4444" : pdfTtsError ? "#ef4444" : "transparent", opacity: pdfTtsLoading ? 0.7 : 1, cursor: pdfTtsLoading ? "not-allowed" : "pointer" }}>
              {pdfTtsLoading ? <Loader2 size={13} strokeWidth={2} className="animate-spin" /> : <Mic size={13} strokeWidth={2} />}
              {pdfTtsLoading ? "Extracting…" : pdfTtsError ? "Retry" : "Read Aloud"}
            </button>
          </div>
        </div>

        {/* Extraction error banner */}
        {pdfTtsError && !pdfTtsLoading && (
          <div style={{ padding: "8px 20px", backgroundColor: "#fff5f5", borderBottom: "1px solid #fed7d7", fontSize: 12, color: "#c53030", fontFamily: "'DM Sans', sans-serif" }}>
            ⚠ {pdfTtsError} — the PDF may be image-based or encrypted.
          </div>
        )}

        {/* ✅ PDF viewer — blob URL, no auth issues, no X-Frame-Options block */}
        <div style={{ flex: 1, position: "relative" }}>
          {pdfLoading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f2f3f5", fontFamily: "'Georgia', serif", color: "#94a3b8", fontSize: 14 }}>
              Loading PDF…
            </div>
          )}
          {pdfError && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff5f5", fontFamily: "'Georgia', serif", color: "#e11d48", fontSize: 14 }}>
              Failed to load PDF: {pdfError}
            </div>
          )}
          {blobUrl && (
            <iframe
              src={blobUrl}              // ✅ blob:// — fetched with auth above
              title={activeReadBook.title}
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            />
          )}
        </div>

        <SummaryPanel isOpen={summaryOpen} onClose={() => setSummaryOpen(false)} pdfUrl={pdfProxyUrl} chapterTitle={summaryTitle} />
        <TTSPlayer isVisible={ttsActive && Boolean(pdfTtsText)} text={pdfTtsText} onClose={() => setTtsActive(false)} />
      </div>
    </>
  );
}