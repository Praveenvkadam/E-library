import { useEffect, useRef, useState } from "react";
import { X, Sparkles, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import useAIServiceStore from "@/store/useaiservicestore";

function KeyPoint({ text, index }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex-shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
        style={{ backgroundColor: "#0d7373" }}>
        {index + 1}
      </span>
      <span className="text-sm leading-relaxed" style={{ color: "#4a5568", fontFamily: "'DM Sans', sans-serif" }}>
        {text}
      </span>
    </li>
  );
}

function Skeleton({ lines = 4 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded"
          style={{ backgroundColor: "#e4e8ed", width: i === lines - 1 ? "60%" : "100%" }} />
      ))}
    </div>
  );
}

export default function SummaryPanel({ isOpen, onClose, chapterText, chapterTitle, pdfUrl }) {
  // ── USE STORE INSTEAD OF RAW FETCH ──────────────────────────────────────
  const { summarizePdfFromUrl, summarizeText } = useAIServiceStore();

  const [status,    setStatus]    = useState("idle");
  const [summary,   setSummary]   = useState("");
  const [keyPoints, setKeyPoints] = useState([]);
  const [errorMsg,  setErrorMsg]  = useState("");
  const panelRef                  = useRef(null);
  const prevChapterTitle          = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (prevChapterTitle.current === chapterTitle && status === "success") return;
    fetchSummary();
    prevChapterTitle.current = chapterTitle;
  }, [isOpen, chapterTitle]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSummary = async () => {
    if (!pdfUrl && (!chapterText || chapterText.trim().length < 100)) {
      setStatus("error");
      setErrorMsg("Not enough text in this chapter to summarize.");
      return;
    }

    setStatus("loading");
    setSummary("");
    setKeyPoints([]);

    try {
      // ── Calls NEXT_PUBLIC_AI_SERVICE_API_URL/ai/summary/... ─────────────
      const data = pdfUrl
        ? await summarizePdfFromUrl(pdfUrl)
        : await summarizeText(chapterText);

      setSummary(data.summary);
      setKeyPoints(data.keyPoints ?? []);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong.");
      setStatus("error");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(13,27,42,0.3)", backdropFilter: "blur(2px)" }}
          onClick={onClose} />
      )}

      <aside ref={panelRef} role="complementary" aria-label="AI Summary"
        className="fixed right-0 z-50 flex flex-col shadow-2xl"
        style={{
          top: "64px", height: "calc(100vh - 64px)", width: "340px",
          backgroundColor: "#ffffff", borderLeft: "1px solid #e4e8ed",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "#e4e8ed" }}>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ backgroundColor: "#edf7f7" }}>
              <Sparkles size={14} style={{ color: "#0d7373" }} strokeWidth={2} />
            </span>
            <span className="font-semibold text-sm" style={{ color: "#0d1b2a", fontFamily: "'DM Sans', sans-serif" }}>
              AI Summary
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button suppressHydrationWarning onClick={fetchSummary} disabled={status === "loading"}
              aria-label="Regenerate summary"
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40"
              style={{ color: "#5a6474" }}>
              <RefreshCw size={15} strokeWidth={2} className={status === "loading" ? "animate-spin" : ""} />
            </button>
            <button suppressHydrationWarning onClick={onClose} aria-label="Close summary panel"
              className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
              style={{ color: "#ffffff", backgroundColor: "#0d7373", boxShadow: "0 2px 6px rgba(13,115,115,0.3)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0a5c5c"; e.currentTarget.style.transform = "scale(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0d7373"; e.currentTarget.style.transform = "scale(1)"; }}>
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Chapter label */}
        {chapterTitle && (
          <div className="px-5 py-3 border-b flex-shrink-0" style={{ borderColor: "#f0f3f6", backgroundColor: "#fafbfc" }}>
            <p className="text-xs font-semibold truncate" style={{ color: "#9aa3ad", letterSpacing: "0.1em", fontFamily: "'DM Sans', sans-serif" }}>
              CHAPTER OVERVIEW
            </p>
            <p className="text-sm mt-0.5 font-medium truncate" style={{ color: "#0d1b2a", fontFamily: "'Playfair Display', serif" }}>
              {chapterTitle}
            </p>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {status === "loading" && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold mb-3" style={{ color: "#9aa3ad", letterSpacing: "0.1em" }}>SUMMARY</p>
                <Skeleton lines={5} />
              </div>
              <div>
                <p className="text-xs font-semibold mb-3" style={{ color: "#9aa3ad", letterSpacing: "0.1em" }}>KEY POINTS</p>
                <Skeleton lines={3} />
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start gap-3 rounded-xl p-4"
              style={{ backgroundColor: "#fff5f5", border: "1px solid #fed7d7" }}>
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#e53e3e" }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#c53030", fontFamily: "'DM Sans', sans-serif" }}>
                  Couldn't generate summary
                </p>
                <p className="text-xs mt-1" style={{ color: "#e53e3e", fontFamily: "'DM Sans', sans-serif" }}>
                  {errorMsg}
                </p>
                <button suppressHydrationWarning onClick={fetchSummary}
                  className="mt-3 text-xs font-semibold underline" style={{ color: "#c53030" }}>
                  Try again
                </button>
              </div>
            </div>
          )}

          {status === "success" && (
            <>
              <div>
                <p className="text-xs font-semibold mb-3" style={{ color: "#9aa3ad", letterSpacing: "0.1em", fontFamily: "'DM Sans', sans-serif" }}>
                  SUMMARY
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#2d3748", fontFamily: "'Lora', serif", lineHeight: "1.8" }}>
                  {summary}
                </p>
              </div>
              {keyPoints.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-3" style={{ color: "#9aa3ad", letterSpacing: "0.1em", fontFamily: "'DM Sans', sans-serif" }}>
                    KEY POINTS
                  </p>
                  <ul className="space-y-3">
                    {keyPoints.map((point, i) => <KeyPoint key={i} text={point} index={i} />)}
                  </ul>
                </div>
              )}
              <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: "#edf7f7" }}>
                <CheckCircle size={13} style={{ color: "#0d7373" }} />
                <span className="text-xs" style={{ color: "#0d7373", fontFamily: "'DM Sans', sans-serif" }}>
                  Generated by AI · May contain inaccuracies
                </span>
              </div>
            </>
          )}

          {status === "idle" && (
            <p className="text-sm text-center" style={{ color: "#9aa3ad", fontFamily: "'DM Sans', sans-serif" }}>
              Opening panel…
            </p>
          )}
        </div>
      </aside>
    </>
  );
}