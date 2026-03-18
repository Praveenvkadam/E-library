/**
 * RightToolbar.jsx  (updated)
 * Accepts onSummaryToggle and onTTSToggle props to wire up Sparkles + Mic buttons.
 * Active states are driven by props (summaryOpen / ttsActive) from the parent.
 */

import { useState } from "react";
import { ZoomIn, ZoomOut, Sun, Sparkles, Moon, FileText, Mic } from "lucide-react";

export default function RightToolbar({
  onZoomIn,
  onZoomOut,
  onSummaryToggle,
  onTTSToggle,
  summaryOpen = false,
  ttsActive   = false,
}) {
  // Track active index for brightness / dark-mode / notes (UI-only state)
  const [localActive, setLocalActive] = useState(null); // null = none of the local-only tools

  const tools = [
    {
      icon:    <ZoomIn   size={18} strokeWidth={2} />,
      label:   "Zoom in",
      onClick: onZoomIn,
      key:     "zoomin",
    },
    {
      icon:    <ZoomOut  size={18} strokeWidth={2} />,
      label:   "Zoom out",
      onClick: onZoomOut,
      key:     "zoomout",
    },
    {
      icon:    <Sun      size={18} strokeWidth={2} />,
      label:   "Brightness",
      key:     "brightness",
      local:   true,
    },
    {
      icon:      <Sparkles size={18} strokeWidth={2} />,
      label:     "AI Summary",
      onClick:   onSummaryToggle,
      key:       "summary",
      controlled: true,
      isActive:  summaryOpen,
      accent:    "#0d7373",
    },
    {
      icon:    <Moon     size={18} strokeWidth={2} />,
      label:   "Dark mode",
      key:     "darkmode",
      local:   true,
    },
    {
      icon:    <FileText size={18} strokeWidth={2} />,
      label:   "Notes",
      key:     "notes",
      local:   true,
      dotColor: "#22c55e",
    },
    {
      icon:      <Mic    size={18} strokeWidth={2} />,
      label:     "Read aloud",
      onClick:   onTTSToggle,
      key:       "tts",
      controlled: true,
      isActive:  ttsActive,
      accent:    "#ef4444",
    },
  ];

  return (
    <aside
      className="flex flex-col items-center py-4 gap-2 rounded-2xl shadow-xl"
      style={{
        width:        "56px",
        backgroundColor: "#0d1b2a",
        margin:       "16px 16px 16px 0",
        alignSelf:    "flex-start",
        position:     "sticky",
        top:          "16px",
      }}
    >
      {tools.map((tool) => {
        // Determine active state
        const isActive = tool.controlled
          ? tool.isActive
          : tool.local && localActive === tool.key;

        const iconColor = isActive
          ? "#ffffff"
          : tool.dotColor
            ? tool.dotColor
            : "#8a9bb0";

        const bgColor = isActive && tool.accent
          ? tool.accent
          : isActive
            ? "rgba(255,255,255,0.12)"
            : "transparent";

        return (
          <div key={tool.key} className="relative">
            <button
              suppressHydrationWarning
              onClick={() => {
                if (tool.controlled) {
                  tool.onClick?.();
                } else if (tool.local) {
                  setLocalActive((prev) => (prev === tool.key ? null : tool.key));
                } else {
                  tool.onClick?.();
                }
              }}
              aria-label={tool.label}
              aria-pressed={isActive}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150 group"
              style={{ backgroundColor: bgColor, color: iconColor }}
            >
              {tool.icon}

              {/* Tooltip */}
              <span
                className="absolute right-full mr-2 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: "#1e3a52" }}
              >
                {tool.label}
              </span>
            </button>

            {/* Active indicator dot (for TTS / summary) */}
            {isActive && (
              <span
                className="absolute top-1.5 right-1.5 block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: tool.accent ?? "#ffffff", boxShadow: `0 0 4px ${tool.accent ?? "#ffffff"}` }}
              />
            )}
          </div>
        );
      })}
    </aside>
  );
}