"use client";

import { useState, useEffect } from "react";

// BookCover SVG
function BookCoverSVG() {
  return (
    <svg viewBox="0 0 160 220" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}>
      <rect width="160" height="220" rx="5" fill="#1a3356" />
      <rect x="0" y="0" width="15" height="220" rx="3" fill="#0f1f36" />
      <text x="7" y="115" textAnchor="middle" fill="rgba(255,255,255,.5)"
        fontSize="5.5" fontFamily="Georgia,serif" letterSpacing=".8"
        transform="rotate(-90,7,115)">MASTERING MODERN ARCHITECTURE</text>
      <rect x="15" y="0" width="145" height="220" rx="3" fill="#1e3f6e" />
      <rect x="22" y="18" width="131" height="130" rx="3" fill="#87ceeb" />
      <ellipse cx="54"  cy="38" rx="19" ry="8"  fill="white" opacity=".9" />
      <ellipse cx="44"  cy="42" rx="11" ry="6"  fill="white" opacity=".9" />
      <ellipse cx="112" cy="33" rx="15" ry="6"  fill="white" opacity=".85" />
      <ellipse cx="101" cy="37" rx="9"  ry="5"  fill="white" opacity=".85" />
      <rect x="45" y="68" width="70" height="72" fill="#d6e8f7" />
      {[0,1,2].map((c) => [0,1,2,3].map((r) => (
        <rect key={`${c}-${r}`}
          x={52 + c * 18} y={75 + r * 14}
          width={10} height={9} rx={1}
          fill={r === 3 && c === 1 ? "#fff9c4" : "#4a90d9"} opacity=".85" />
      )))}
      <rect x="22" y="138" width="131" height="10" fill="#4caf50" opacity=".7" />
      <rect x="22" y="146" width="131" height="3"  fill="#388e3c" opacity=".5" />
      <rect x="22" y="150" width="131" height="70" fill="#112240" />
      <line x1="30" y1="162" x2="145" y2="162" stroke="rgba(255,255,255,.12)" strokeWidth=".5" />
      <text x="87" y="176" textAnchor="middle" fill="white"   fontSize="9.5" fontWeight="bold" fontFamily="Georgia,serif" letterSpacing="1.6">MASTERING</text>
      <text x="87" y="190" textAnchor="middle" fill="white"   fontSize="9.5" fontWeight="bold" fontFamily="Georgia,serif" letterSpacing="1.6">MODERN</text>
      <text x="87" y="204" textAnchor="middle" fill="#7ec8e3" fontSize="9.5" fontWeight="bold" fontFamily="Georgia,serif" letterSpacing="1.6">ARCHITECTURE</text>
      <rect x="15" y="0" width="22" height="220" fill="white" opacity=".04" />
    </svg>
  );
}

export default function HeroBanner() {
  const [tick, setTick] = useState(0);

  // Floating animation via JS
  useEffect(() => {
    let frame;
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      setTick(ts - start);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Smooth sine wave: 0 → 1 → 0 over 3.8s
  const progress  = Math.sin((tick / 3800) * Math.PI);          // 0..1..0
  const floatY    = -22 * progress;                              // 0 → -22px
  const rotation  = 5 + 2 * progress;                           // 5° → 7°
  const shadowW   = 110 - 28 * progress;                        // 110 → 82
  const shadowOp  = 0.28 - 0.18 * progress;                     // 0.28 → 0.10

  return (
    <div style={{
      background: "linear-gradient(130deg, #0a7c72 0%, #0d9488 45%, #0891b2 100%)",
      borderRadius: 20,
      padding: "52px 60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 280,
      overflow: "hidden",
      position: "relative",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Decorative blobs */}
      <div style={{ position:"absolute", top:-70, right:-70, width:300, height:300,
        borderRadius:"50%", background:"rgba(255,255,255,.05)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-90, left:"35%", width:220, height:220,
        borderRadius:"50%", background:"rgba(255,255,255,.04)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", inset:0,
        backgroundImage:"radial-gradient(circle at 72% 50%, rgba(255,255,255,.07) 0%, transparent 58%)",
        pointerEvents:"none" }} />

      {/* Left: text */}
      <div style={{ flex:1, maxWidth:460, zIndex:1 }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:6,
          background:"rgba(255,255,255,.18)", backdropFilter:"blur(8px)",
          padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:600,
          color:"white", marginBottom:18, border:"1px solid rgba(255,255,255,.25)",
        }}>
          <span style={{ color:"#fde68a" }}>✦</span> New Arrival
        </div>

        <h1 style={{ fontSize:38, fontWeight:800, color:"white",
          margin:"0 0 14px", lineHeight:1.12, letterSpacing:"-.5px" }}>
          Mastering Modern<br />Architecture
        </h1>

        <p style={{ fontSize:14, color:"rgba(255,255,255,.82)",
          margin:"0 0 30px", lineHeight:1.65, maxWidth:380 }}>
          Dive into the latest design philosophies shaping the skylines of the future.
          Exclusively available for our premium members.
        </p>

        <div style={{ display:"flex", gap:12 }}>
          <button style={{
            background:"#f97316", color:"#fff", border:"none",
            padding:"12px 26px", borderRadius:40, fontWeight:700, fontSize:14,
            cursor:"pointer", display:"inline-flex", alignItems:"center", gap:7,
            boxShadow:"0 4px 18px rgba(249,115,22,.42)",
            fontFamily:"'Inter',sans-serif",
          }}>📖 Borrow Now</button>

          <button style={{
            background:"rgba(255,255,255,.14)", color:"#fff",
            border:"1.5px solid rgba(255,255,255,.38)",
            padding:"12px 26px", borderRadius:40, fontWeight:600, fontSize:14,
            cursor:"pointer", fontFamily:"'Inter',sans-serif",
          }}>Details</button>
        </div>
      </div>

      {/* Right: floating book */}
      <div style={{ position:"relative", width:170, height:235,
        flexShrink:0, marginLeft:40, zIndex:1 }}>

        
        <div style={{
          width:"100%", height:"100%",
          transform: `translateY(${floatY}px) rotate(${rotation}deg)`,
          filter: `drop-shadow(0 ${28 + 16 * (1 - progress)}px ${36 + 16 * (1 - progress)}px rgba(0,0,0,${0.38 - 0.2 * progress}))`,
          transition: "none",
        }}>
          <BookCoverSVG />
        </div>

       
        <div style={{
          position:"absolute", bottom:-14, left:"50%",
          transform: `translateX(-50%)`,
          width: shadowW,
          height:18,
          background:"rgba(0,0,0,0.38)",
          borderRadius:"50%",
          filter:"blur(9px)",
          opacity: shadowOp,
        }} />
      </div>
    </div>
  );
}