import { useState } from "react";
import { ZoomIn, ZoomOut, Sun, Sparkles, Moon, FileText, Mic } from "lucide-react";

export default function RightToolbar({ onZoomIn, onZoomOut }) {
  const [activeIdx, setActiveIdx] = useState(2);

  const tools = [
    { icon: <ZoomIn    size={18} strokeWidth={2} />, label: "Zoom in",    onClick: onZoomIn },
    { icon: <ZoomOut   size={18} strokeWidth={2} />, label: "Zoom out",   onClick: onZoomOut },
    { icon: <Sun       size={18} strokeWidth={2} />, label: "Brightness", color: "#0d7373" },
    { icon: <Sparkles  size={18} strokeWidth={2} />, label: "AI Assist" },
    { icon: <Moon      size={18} strokeWidth={2} />, label: "Dark mode" },
    { icon: <FileText  size={18} strokeWidth={2} />, label: "Notes",      accent: "#22c55e" },
    { icon: <Mic       size={18} strokeWidth={2} />, label: "Read aloud", accent: "#ef4444" },
  ];

  return (
    <aside
      className="flex flex-col items-center py-4 gap-2 rounded-2xl shadow-xl"
      style={{ width: "56px", backgroundColor: "#0d1b2a", margin: "16px 16px 16px 0", alignSelf: "flex-start", position: "sticky", top: "16px" }}
    >
      {tools.map((tool, idx) => {
        const isActive = idx === activeIdx;
        const color = tool.accent ? tool.accent : isActive ? "#ffffff" : "#8a9bb0";
        return (
          <button
            suppressHydrationWarning
            key={idx}
            onClick={() => { setActiveIdx(idx); tool.onClick?.(); }}
            aria-label={tool.label}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150 group"
            style={{ backgroundColor: isActive && tool.color ? tool.color : "transparent", color }}
          >
            {tool.icon}
            <span
              className="absolute right-full mr-2 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: "#1e3a52" }}
            >
              {tool.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
}