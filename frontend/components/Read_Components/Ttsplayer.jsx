/**
 * TTSPlayer.jsx
 *
 * Primary engine  : Browser Web Speech API  (works immediately, no backend needed)
 * Optional upgrade: POST /api/ai/tts/generate-url  (Sarvam Bulbul v3)
 *                   Only attempted when USE_BACKEND = true AND the route exists.
 *                   Falls back silently to browser speech on any failure.
 *
 * Props:
 *   isVisible  boolean  — show/hide the bar
 *   text       string   — plain text to read (must be non-empty when visible)
 *   onClose    fn       — dismiss handler
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Play, Pause, Square, ChevronUp, ChevronDown, Mic } from "lucide-react";

// ─── Set to true once /api/ai/tts/generate-url is confirmed working ──────────
const USE_BACKEND = false;

const SPEEDS  = [0.75, 1, 1.25, 1.5, 2];

function fmt(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function TTSPlayer({ isVisible, text, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx,  setSpeedIdx]  = useState(1);          // default 1×
  const [elapsed,   setElapsed]   = useState(0);
  const [duration,  setDuration]  = useState(0);
  const [status,    setStatus]    = useState("idle");     // idle|loading|playing|paused|error
  const [errorMsg,  setErrorMsg]  = useState("");

  const utterRef   = useRef(null);
  const audioRef   = useRef(null);
  const timerRef   = useRef(null);
  const elapsedRef = useRef(0);

  const speed = SPEEDS[speedIdx];

  // keep ref in sync
  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);

  // ── Timer helpers ───────────────────────────────────────────────────────
  const startTimer = useCallback((from = 0) => {
    clearInterval(timerRef.current);
    const origin = Date.now() - from * 1000;
    timerRef.current = setInterval(
      () => setElapsed(Math.round((Date.now() - origin) / 1000)),
      400
    );
  }, []);

  // ── Full stop ───────────────────────────────────────────────────────────
  const stopAll = useCallback(() => {
    clearInterval(timerRef.current);
    if (utterRef.current) { window.speechSynthesis?.cancel(); utterRef.current = null; }
    if (audioRef.current)  { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; }
    setIsPlaying(false);
    setStatus("idle");
    setElapsed(0);
    elapsedRef.current = 0;
  }, []);

  useEffect(() => { if (!isVisible) stopAll(); }, [isVisible, stopAll]);
  // Reset when text changes (new chapter / new PDF)
  useEffect(() => { stopAll(); }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Browser Web Speech (primary) ────────────────────────────────────────
  const playNative = useCallback((from = 0) => {
    if (!window.speechSynthesis) {
      setStatus("error");
      setErrorMsg("Text-to-speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utter  = new SpeechSynthesisUtterance(text);
    utter.rate   = speed;
    utter.lang   = "en-IN";

    // Estimate duration: ~150 wpm baseline adjusted for speed
    const words  = text.trim().split(/\s+/).length;
    setDuration(Math.round((words / 150) * 60 / speed));

    utter.onstart = () => { setStatus("playing"); setIsPlaying(true);  startTimer(from); };
    utter.onend   = () => { clearInterval(timerRef.current); setStatus("idle"); setIsPlaying(false); setElapsed(0); };
    utter.onerror = (e) => {
      if (e.error === "interrupted") return; // cancelled by us, not a real error
      setStatus("error");
      setErrorMsg("Speech synthesis failed. Please try again.");
      setIsPlaying(false);
    };

    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [text, speed, startTimer]);

  // ── Backend Sarvam TTS (optional upgrade) ───────────────────────────────
  const playBackend = useCallback(async () => {
    setStatus("loading");
    try {
      const res  = await fetch("/api/ai/tts/generate-url", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text, pace: speed }),
      });
      if (!res.ok) throw new Error(`${res.status}`);

      const json = await res.json();
      if (!json.success || !json.data?.downloadUrl) throw new Error("No URL");

      const audio          = new Audio(json.data.downloadUrl);
      audio.playbackRate   = speed;
      audioRef.current     = audio;

      audio.addEventListener("loadedmetadata", () => setDuration(Math.round(audio.duration)));
      audio.addEventListener("ended",  () => { clearInterval(timerRef.current); setStatus("idle"); setIsPlaying(false); });
      audio.addEventListener("error",  () => { audioRef.current = null; playNative(0); }); // fallback

      await audio.play();
      setStatus("playing");
      setIsPlaying(true);
      startTimer(0);
    } catch {
      // Backend unavailable — use browser speech silently
      playNative(0);
    }
  }, [text, speed, startTimer, playNative]);

  // ── Play / Pause ────────────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (status === "loading") return;

    if (status === "idle") {
      USE_BACKEND ? playBackend() : playNative(0);
      return;
    }

    if (isPlaying) {
      // → Pause
      clearInterval(timerRef.current);
      if (audioRef.current)  audioRef.current.pause();
      else                   window.speechSynthesis?.pause();
      setIsPlaying(false);
      setStatus("paused");
    } else {
      // → Resume
      if (audioRef.current) {
        audioRef.current.play();
        setStatus("playing"); setIsPlaying(true); startTimer(elapsedRef.current);
      } else {
        // Web Speech can't resume mid-sentence on all browsers — restart from scratch
        window.speechSynthesis?.cancel();
        playNative(0);
      }
    }
  };

  // ── Speed change ────────────────────────────────────────────────────────
  const handleSpeed = (dir) => {
    const next     = Math.max(0, Math.min(SPEEDS.length - 1, speedIdx + dir));
    setSpeedIdx(next);
    const newSpeed = SPEEDS[next];

    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    } else if (isPlaying) {
      // Re-speak at new rate
      const was = elapsedRef.current;
      window.speechSynthesis?.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate  = newSpeed;
      utter.lang  = "en-IN";
      utter.onstart = () => { setStatus("playing"); setIsPlaying(true); startTimer(was); };
      utter.onend   = () => { clearInterval(timerRef.current); setStatus("idle"); setIsPlaying(false); setElapsed(0); };
      utter.onerror = (e) => { if (e.error !== "interrupted") { setStatus("error"); setErrorMsg("Speech failed."); } };
      utterRef.current = utter;
      window.speechSynthesis.speak(utter);
    }
  };

  const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 0;

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-20 lg:bottom-6 left-1/2 z-50 shadow-2xl rounded-2xl overflow-hidden"
      style={{
        transform:       "translateX(-50%)",
        width:           "min(440px, calc(100vw - 32px))",
        backgroundColor: "#0d1b2a",
        border:          "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Progress bar */}
      <div className="w-full h-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
        <div
          style={{
            height:          "100%",
            width:           `${progress * 100}%`,
            backgroundColor: "#0d7373",
            borderRadius:    "9999px",
            transition:      "width 0.4s linear",
          }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-3">

        {/* Icon */}
        <span
          className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
          style={{ backgroundColor: status === "playing" ? "#0d7373" : "rgba(255,255,255,0.08)" }}
        >
          {status === "loading"
            ? <span className="block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <Mic size={14} strokeWidth={2} style={{ color: status === "playing" ? "#fff" : "#8a9bb0" }} />
          }
        </span>

        {/* Label + time */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold" style={{ color: "#ffffff", fontFamily: "'DM Sans', sans-serif" }}>
            {status === "loading" ? "Preparing…"
              : status === "error"  ? "Playback error"
              : status === "idle"   ? "Read Aloud"
              : isPlaying           ? "Now reading…"
              :                       "Paused"}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: status === "error" ? "#f87171" : "#8a9bb0", fontFamily: "'DM Sans', sans-serif" }}>
            {status === "error" ? errorMsg : `${fmt(elapsed)}${duration > 0 ? ` / ${fmt(duration)}` : ""}`}
          </p>
        </div>

        {/* Speed selector */}
        <div className="flex flex-col items-center" style={{ gap: 2 }}>
          <button suppressHydrationWarning onClick={() => handleSpeed(1)} aria-label="Faster"
            style={{ color: "#8a9bb0", background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: 0 }}>
            <ChevronUp size={12} strokeWidth={2.5} />
          </button>
          <span style={{ color: "#0d7373", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, minWidth: "2rem", textAlign: "center" }}>
            {speed}×
          </span>
          <button suppressHydrationWarning onClick={() => handleSpeed(-1)} aria-label="Slower"
            style={{ color: "#8a9bb0", background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: 0 }}>
            <ChevronDown size={12} strokeWidth={2.5} />
          </button>
        </div>

        {/* Play / Pause */}
        <button
          suppressHydrationWarning
          onClick={handlePlayPause}
          disabled={status === "loading" || status === "error"}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          style={{ backgroundColor: "#0d7373", flexShrink: 0 }}
        >
          {status === "loading"
            ? <span className="block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : isPlaying
              ? <Pause size={16} strokeWidth={2.5} style={{ color: "#fff" }} />
              : <Play  size={16} strokeWidth={2.5} style={{ color: "#fff", marginLeft: 2 }} />
          }
        </button>

        {/* Stop */}
        <button suppressHydrationWarning onClick={stopAll}
          disabled={status === "idle" || status === "loading"}
          aria-label="Stop"
          className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-white/10 disabled:opacity-30"
          style={{ color: "#8a9bb0", background: "none", border: "none", cursor: "pointer" }}>
          <Square size={13} strokeWidth={2} />
        </button>

        {/* Close */}
        <button suppressHydrationWarning onClick={() => { stopAll(); onClose(); }}
          aria-label="Close TTS"
          className="flex items-center justify-center w-7 h-7 rounded-full transition-colors hover:bg-white/10"
          style={{ color: "#8a9bb0", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
          <X size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}