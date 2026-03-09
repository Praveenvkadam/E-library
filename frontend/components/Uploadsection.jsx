"use client";

import { useState, useRef } from "react";

// ─── Static data ─────────────────────────────────────────────────────────────

const RECENT_BOOKS = [
  { id: 1, title: "The Modern Architecture", author: "Julian Thorne",    status: "LIVE",       bg: "#fefce8", spine: "#fde047" },
  { id: 2, title: "Quantum Horizons",         author: "Dr. Sarah Chen",  status: "PROCESSING", bg: "#0f766e", spine: "#134e4a" },
  { id: 3, title: "The Creative Path",        author: "Elena Rodriguez", status: "LIVE",       bg: "#065f46", spine: "#022c22" },
  { id: 4, title: "Silent Forests",           author: "Marcus Green",    status: "DRAFT",      bg: "#059669", spine: "#065f46" },
];

const STATUS_COLOR  = { LIVE: "#16a34a", PROCESSING: "#d97706", DRAFT: "#94a3b8" };
const STATUS_DOT_BG = { LIVE: "#22c55e", PROCESSING: "#fbbf24", DRAFT: "#cbd5e1" };

// ─── Mini book thumbnail ──────────────────────────────────────────────────────

function BookThumb({ book }) {
  return (
    <div style={{
      width: 44, height: 60, borderRadius: 4, flexShrink: 0,
      background: book.bg, position: "relative", overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,.12)",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: book.spine }} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UploadSection({ setActivePage }) {
  const [coverPreview,  setCoverPreview]  = useState(null);
  const [coverDragging, setCoverDragging] = useState(false);
  const [pdfFile,  setPdfFile]   = useState(null);
  const [title,    setTitle]     = useState("");
  const [author,   setAuthor]    = useState("");
  const [pubDate,  setPubDate]   = useState("");
  const [language, setLanguage]  = useState("");
  const [description, setDescription] = useState("");

  const coverInputRef = useRef(null);
  const pdfInputRef   = useRef(null);

  const handleCoverFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setCoverPreview(URL.createObjectURL(file));
  };

  const onCoverDrop = (e) => {
    e.preventDefault();
    setCoverDragging(false);
    handleCoverFile(e.dataTransfer.files[0]);
  };

  const handlePdfFile = (file) => {
    if (!file || file.type !== "application/pdf") return;
    setPdfFile(file);
  };

  const allFilled = coverPreview && pdfFile && title && author && description && pubDate && language;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Page heading ───────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", letterSpacing: "-.4px" }}>
          Upload New Book
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
          Contribute to our growing digital collection and share knowledge.
        </p>
      </div>

      {/* ── Two-column layout ──────────────────────── */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* ── LEFT card ──────────────────────────────── */}
        <div style={{
          flex: 1, minWidth: 420,
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          padding: 24,
          boxShadow: "0 1px 8px rgba(0,0,0,.06)",
        }}>
          <div style={{ display: "flex", gap: 24 }}>

            {/* Book Cover drop-zone */}
            <div style={{ flexShrink: 0, width: 200 }}>
              <p style={labelStyle}>Book Cover</p>
              <div
                onDragOver={(e) => { e.preventDefault(); setCoverDragging(true); }}
                onDragLeave={() => setCoverDragging(false)}
                onDrop={onCoverDrop}
                onClick={() => coverInputRef.current?.click()}
                style={{
                  position: "relative",
                  cursor: "pointer",
                  borderRadius: 12,
                  border: `2px dashed ${coverDragging ? "#0d9488" : "#cbd5e1"}`,
                  background: coverDragging ? "#f0fdfa" : "#f8fafc",
                  height: 260,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  transition: "border-color .2s, background .2s",
                }}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingBottom: 48 }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Drop your cover here</p>
                    <p style={{ fontSize: 11, color: "#94a3b8" }}>PNG, JPG up to 5MB</p>
                  </div>
                )}
                <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }}
                    style={{
                      background: "#0d9488", color: "#fff",
                      border: "none", borderRadius: 20,
                      padding: "6px 18px", fontSize: 12, fontWeight: 600,
                      cursor: "pointer", whiteSpace: "nowrap",
                      boxShadow: "0 2px 8px rgba(13,148,136,.35)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Select Image
                  </button>
                </div>
              </div>
              <input ref={coverInputRef} type="file" accept="image/png,image/jpeg"
                style={{ display: "none" }} onChange={(e) => handleCoverFile(e.target.files[0])} />
            </div>

            {/* Right: Document + Details */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

              {/* PDF upload */}
              <div>
                <p style={labelStyle}>Book Document</p>
                <div style={{
                  border: "1px solid #e2e8f0", borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                  background: "#f8fafc",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: "#fee2e2",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {pdfFile ? (
                      <>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pdfFile.name}</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{(pdfFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>PDF File</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Max size: 50MB</p>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => pdfInputRef.current?.click()}
                    style={{
                      border: "1.5px solid #e2e8f0", borderRadius: 8,
                      background: "#fff", color: "#475569",
                      padding: "5px 14px", fontSize: 12, fontWeight: 600,
                      cursor: "pointer", flexShrink: 0,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Choose
                  </button>
                </div>
                <input ref={pdfInputRef} type="file" accept="application/pdf"
                  style={{ display: "none" }} onChange={(e) => handlePdfFile(e.target.files[0])} />
              </div>

              {/* Details fields */}
              <div>
                <p style={labelStyle}>Details</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    placeholder="Book Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    placeholder="Author Name"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    style={inputStyle}
                  />
                  <textarea
                    placeholder="Book Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="date"
                      value={pubDate}
                      onChange={(e) => setPubDate(e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      style={{ ...inputStyle, flex: 1, cursor: "pointer" }}
                    >
                      <option value="" disabled>Language</option>
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="es">Spanish</option>
                      <option value="zh">Chinese</option>
                      <option value="ar">Arabic</option>
                      <option value="hi">Hindi</option>
                      <option value="pt">Portuguese</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer bar */}
          <div style={{
            marginTop: 24, paddingTop: 20,
            borderTop: "1px solid #f1f5f9",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <p style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              All fields are required before publishing.
            </p>
            <button
              disabled={!allFilled}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: allFilled ? "#f97316" : "#fdba74",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "10px 24px", fontSize: 13, fontWeight: 700,
                cursor: allFilled ? "pointer" : "not-allowed",
                fontFamily: "'Inter', sans-serif",
                boxShadow: allFilled ? "0 4px 14px rgba(249,115,22,.3)" : "none",
                transition: "background .2s, box-shadow .2s",
              }}
            >
              Publish Book
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── RIGHT sidebar ───────────────────────────── */}
        <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Recently Uploaded */}
          <div style={{
            background: "#fff", borderRadius: 16,
            border: "1px solid #e2e8f0", padding: 20,
            boxShadow: "0 1px 8px rgba(0,0,0,.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Recently Uploaded</h2>
              <button
                onClick={() => setActivePage && setActivePage("Catalog")}
                style={{ fontSize: 12, fontWeight: 600, color: "#0d9488", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
              >
                View All
              </button>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              {RECENT_BOOKS.map((book) => (
                <li key={book.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <BookThumb book={book} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {book.title}
                    </p>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>by {book.author}</p>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 10, fontWeight: 700, letterSpacing: ".06em",
                      color: STATUS_COLOR[book.status], marginTop: 3,
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: STATUS_DOT_BG[book.status],
                        display: "inline-block",
                      }} />
                      {book.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro-Tip card */}
          <div style={{
            background: "#f0fdfa", border: "1px solid #ccfbf1",
            borderRadius: 16, padding: 16,
            boxShadow: "0 1px 8px rgba(0,0,0,.04)",
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#0d9488", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="9" y1="18" x2="15" y2="18" />
                <line x1="10" y1="22" x2="14" y2="22" />
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 1.98 1.5 3.5.74.76 1.23 1.52 1.41 2.5" />
              </svg>
              Upload Pro-Tip:
            </p>
            <p style={{ fontSize: 12, color: "#0f766e", lineHeight: 1.6 }}>
              High-resolution cover images (3:4 ratio) typically get 40% more engagement from readers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelStyle = {
  fontSize: 10, fontWeight: 700, letterSpacing: ".1em",
  textTransform: "uppercase", color: "#94a3b8",
  marginBottom: 10, display: "block",
};

const inputStyle = {
  width: "100%", padding: "10px 14px",
  border: "1px solid #e2e8f0", borderRadius: 10,
  fontSize: 13, color: "#1e293b", background: "#fff",
  outline: "none", fontFamily: "'Inter', sans-serif",
};