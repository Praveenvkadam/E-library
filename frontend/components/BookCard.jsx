// ── BookCard.jsx ──────────────────────────────────────────────────────────────
// Props:
//   book: { id, title, author, genre, badge?, badgeColor?, bg, cover }
//   onBorrow?: (book) => void

const CARD_STYLES = `
  .book-card {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,.07);
    transition: transform .2s, box-shadow .2s;
    font-family: 'Inter', sans-serif;
  }
  .book-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,.13);
  }
  .btn-borrow-card {
    width: 100%;
    background: #fff;
    color: #0d9488;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 9px 0;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background .15s, border-color .15s, transform .15s;
    font-family: 'Inter', sans-serif;
  }
  .btn-borrow-card:hover {
    background: #f0fdfa;
    border-color: #0d9488;
    transform: translateY(-1px);
  }
`;

// ── Thumbnail SVG ─────────────────────────────────────────────────────────────
function BookThumb({ book }) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <rect width="120" height="160" rx="4" fill={book.bg} />
      <rect x="0" y="0" width="10" height="160" rx="2" fill="rgba(0,0,0,.25)" />
      <rect x="10" y="0" width="110" height="160" rx="2" fill={book.cover} />
      <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,.9)"
        fontSize="8" fontWeight="bold" fontFamily="Georgia,serif">
        {book.title.split(" ").slice(0, 2).join(" ")}
      </text>
      <text x="60" y="85" textAnchor="middle" fill="rgba(255,255,255,.7)"
        fontSize="7" fontFamily="Georgia,serif">
        {book.title.split(" ").slice(2).join(" ")}
      </text>
      <line x1="20" y1="128" x2="100" y2="128" stroke="rgba(255,255,255,.15)" strokeWidth=".5" />
      <text x="60" y="143" textAnchor="middle" fill="rgba(255,255,255,.5)"
        fontSize="5.5" fontFamily="sans-serif">
        {book.author}
      </text>
      {/* Gloss */}
      <rect x="10" y="0" width="16" height="160" fill="white" opacity=".04" />
    </svg>
  );
}

// ── BookCard ──────────────────────────────────────────────────────────────────
export default function BookCard({ book, onBorrow }) {
  // Inject styles once (idempotent guard via data attribute)
  if (typeof document !== "undefined" && !document.querySelector("[data-bookcard-styles]")) {
    const tag = document.createElement("style");
    tag.setAttribute("data-bookcard-styles", "true");
    tag.textContent = CARD_STYLES;
    document.head.appendChild(tag);
  }

  return (
    <div className="book-card">
      {/* Cover image */}
      <div style={{ position: "relative", height: 200 }}>
        <BookThumb book={book} />

        {/* Badge */}
        {book.badge && (
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: book.badgeColor ?? "#f97316",
            color: "white",
            fontSize: 10, fontWeight: 700,
            padding: "3px 8px", borderRadius: 4,
            letterSpacing: ".5px",
            fontFamily: "'Inter', sans-serif",
          }}>
            {book.badge}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#0d9488", letterSpacing: "1px", marginBottom: 4 }}>
          {book.genre}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 3 }}>
          {book.title}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>
          {book.author}
        </div>
        <button className="btn-borrow-card" onClick={() => onBorrow?.(book)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
          Borrow
        </button>
      </div>
    </div>
  );
}