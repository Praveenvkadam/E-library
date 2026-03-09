// ─── HeroBanner.jsx ───────────────────────────────────────────────────────────
// Floating book animation runs via CSS keyframes injected into a <style> tag.
// The book floats up/down with a subtle rotation; the shadow syncs beneath it.

const HERO_STYLES = `
  @keyframes bookFloat {
    0%, 100% {
      transform: translateY(0px) rotate(5deg);
      filter: drop-shadow(0 28px 36px rgba(0,0,0,0.38));
    }
    50% {
      transform: translateY(-22px) rotate(7deg);
      filter: drop-shadow(0 44px 52px rgba(0,0,0,0.18));
    }
  }

  @keyframes shadowPulse {
    0%, 100% {
      transform: translateX(-50%) scaleX(1);
      opacity: 0.28;
    }
    50% {
      transform: translateX(-50%) scaleX(0.72);
      opacity: 0.10;
    }
  }

  @keyframes heroBadgeFade {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes heroTitleFade {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .book-float {
    animation: bookFloat 3.8s ease-in-out infinite;
  }

  .book-shadow {
    position: absolute;
    bottom: -14px;
    left: 50%;
    transform: translateX(-50%);
    width: 110px;
    height: 18px;
    background: rgba(0, 0, 0, 0.38);
    border-radius: 50%;
    filter: blur(9px);
    animation: shadowPulse 3.8s ease-in-out infinite;
  }

  .hero-badge  { animation: heroBadgeFade  0.55s ease-out 0.10s both; }
  .hero-title  { animation: heroTitleFade  0.55s ease-out 0.25s both; }
  .hero-desc   { animation: heroTitleFade  0.55s ease-out 0.40s both; }
  .hero-btns   { animation: heroTitleFade  0.55s ease-out 0.55s both; }

  .btn-borrow-now {
    background: #f97316;
    color: #fff;
    border: none;
    padding: 12px 26px;
    border-radius: 40px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    box-shadow: 0 4px 18px rgba(249,115,22,.42);
    transition: transform .15s, box-shadow .15s;
    font-family: 'Inter', sans-serif;
  }
  .btn-borrow-now:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 26px rgba(249,115,22,.55);
  }

  .btn-details {
    background: rgba(255,255,255,.14);
    color: #fff;
    border: 1.5px solid rgba(255,255,255,.38);
    padding: 12px 26px;
    border-radius: 40px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: background .15s;
    font-family: 'Inter', sans-serif;
  }
  .btn-details:hover {
    background: rgba(255,255,255,.24);
  }
`;

// ── Inline SVG book cover ─────────────────────────────────────────────────────
function BookCoverSVG() {
  return (
    <svg
      viewBox="0 0 160 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Base */}
      <rect width="160" height="220" rx="5" fill="#1a3356" />
      {/* Spine */}
      <rect x="0" y="0" width="15" height="220" rx="3" fill="#0f1f36" />
      <text
        x="7" y="115" textAnchor="middle"
        fill="rgba(255,255,255,.5)" fontSize="5.5"
        fontFamily="Georgia, serif" letterSpacing=".8"
        transform="rotate(-90,7,115)"
      >
        MASTERING MODERN ARCHITECTURE
      </text>
      {/* Cover page */}
      <rect x="15" y="0" width="145" height="220" rx="3" fill="#1e3f6e" />
      {/* Sky */}
      <rect x="22" y="18" width="131" height="130" rx="3" fill="#87ceeb" />
      {/* Clouds */}
      <ellipse cx="54"  cy="38" rx="19" ry="8"  fill="white" opacity=".9" />
      <ellipse cx="44"  cy="42" rx="11" ry="6"  fill="white" opacity=".9" />
      <ellipse cx="112" cy="33" rx="15" ry="6"  fill="white" opacity=".85" />
      <ellipse cx="101" cy="37" rx="9"  ry="5"  fill="white" opacity=".85" />
      {/* Building */}
      <rect x="45" y="68" width="70" height="72" fill="#d6e8f7" />
      {[0, 1, 2].map((c) =>
        [0, 1, 2, 3].map((r) => (
          <rect
            key={`w-${c}-${r}`}
            x={52 + c * 18} y={75 + r * 14}
            width={10} height={9} rx={1}
            fill={r === 3 && c === 1 ? "#fff9c4" : "#4a90d9"}
            opacity=".85"
          />
        ))
      )}
      {/* Ground */}
      <rect x="22" y="138" width="131" height="10" fill="#4caf50" opacity=".7" />
      <rect x="22" y="146" width="131" height="3"  fill="#388e3c" opacity=".5" />
      {/* Title strip */}
      <rect x="22" y="150" width="131" height="70" fill="#112240" />
      <line x1="30" y1="162" x2="145" y2="162" stroke="rgba(255,255,255,.12)" strokeWidth=".5" />
      <text x="87" y="176" textAnchor="middle" fill="white"   fontSize="9.5" fontWeight="bold" fontFamily="Georgia,serif" letterSpacing="1.6">MASTERING</text>
      <text x="87" y="190" textAnchor="middle" fill="white"   fontSize="9.5" fontWeight="bold" fontFamily="Georgia,serif" letterSpacing="1.6">MODERN</text>
      <text x="87" y="204" textAnchor="middle" fill="#7ec8e3" fontSize="9.5" fontWeight="bold" fontFamily="Georgia,serif" letterSpacing="1.6">ARCHITECTURE</text>
      {/* Gloss highlight */}
      <rect x="15" y="0" width="22" height="220" fill="white" opacity=".04" />
    </svg>
  );
}

// ── HeroBanner ────────────────────────────────────────────────────────────────
export default function HeroBanner() {
  return (
    <>
      <style>{HERO_STYLES}</style>

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

        {/* ── Decorative background layers ── */}
        <div style={{
          position: "absolute", top: -70, right: -70,
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(255,255,255,.05)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -90, left: "35%",
          width: 220, height: 220, borderRadius: "50%",
          background: "rgba(255,255,255,.04)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 72% 50%, rgba(255,255,255,.07) 0%, transparent 58%)",
          pointerEvents: "none",
        }} />

        {/* ── Left: Text Content ── */}
        <div style={{ flex: 1, maxWidth: 460, zIndex: 1 }}>

          {/* Badge */}
          <div className="hero-badge" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,.18)", backdropFilter: "blur(8px)",
            padding: "5px 14px", borderRadius: 20,
            fontSize: 12, fontWeight: 600, color: "white",
            marginBottom: 18, border: "1px solid rgba(255,255,255,.25)",
          }}>
            <span style={{ color: "#fde68a" }}>✦</span> New Arrival
          </div>

          {/* Title */}
          <h1 className="hero-title" style={{
            fontSize: 38, fontWeight: 800, color: "white",
            margin: "0 0 14px", lineHeight: 1.12, letterSpacing: "-.5px",
          }}>
            Mastering Modern<br />Architecture
          </h1>

          {/* Description */}
          <p className="hero-desc" style={{
            fontSize: 14, color: "rgba(255,255,255,.82)",
            margin: "0 0 30px", lineHeight: 1.65, maxWidth: 380,
          }}>
            Dive into the latest design philosophies shaping the skylines of the future.
            Exclusively available for our premium members.
          </p>

          {/* Buttons */}
          <div className="hero-btns" style={{ display: "flex", gap: 12 }}>
            <button className="btn-borrow-now">📖 Borrow Now</button>
            <button className="btn-details">Details</button>
          </div>
        </div>

        {/* ── Right: Floating Book ── */}
        <div style={{
          position: "relative",
          width: 170, height: 235,
          flexShrink: 0,
          marginLeft: 40,
          zIndex: 1,
        }}>
          {/* Book with float animation */}
          <div className="book-float" style={{ width: "100%", height: "100%" }}>
            <BookCoverSVG />
          </div>
          {/* Shadow beneath book */}
          <div className="book-shadow" />
        </div>

      </div>
    </>
  );
}