"use client";

import { useState, useRef, useEffect } from "react";
import useBookStore from "@/store/usebookstore";

// ─── Static sidebar data (replace with real loadAll() if you want live data) ──

const STATUS_COLOR  = { LIVE: "#16a34a", PROCESSING: "#d97706", DRAFT: "#94a3b8" };
const STATUS_DOT_BG = { LIVE: "#22c55e", PROCESSING: "#fbbf24", DRAFT: "#cbd5e1" };

const CATEGORIES = [
  "Fiction", "Non-Fiction", "Science", "Technology", "History",
  "Biography", "Self-Help", "Philosophy", "Art", "Education",
];

const LANGUAGES = [
  { value: "English",    label: "English" },
  { value: "French",     label: "French" },
  { value: "German",     label: "German" },
  { value: "Spanish",    label: "Spanish" },
  { value: "Chinese",    label: "Chinese" },
  { value: "Arabic",     label: "Arabic" },
  { value: "Hindi",      label: "Hindi" },
  { value: "Portuguese", label: "Portuguese" },
];

// ─── Mini book thumbnail ───────────────────────────────────────────────────────

const SPINE_COLORS = ["#134e4a", "#022c22", "#065f46", "#1e40af", "#7c3aed", "#991b1b"];
const BG_COLORS    = ["#fefce8", "#f0fdfa", "#ecfdf5", "#eff6ff", "#f5f3ff", "#fff1f2"];

function BookThumb({ book, index = 0 }) {
  const bg    = BG_COLORS[index % BG_COLORS.length];
  const spine = SPINE_COLORS[index % SPINE_COLORS.length];

  // If the book has a real image, show it
  if (book.b_imageUrl) {
    return (
      <div style={{
        width: 44, height: 60, borderRadius: 4, flexShrink: 0,
        overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.12)",
      }}>
        <img
          src={book.b_imageUrl}
          alt={book.b_name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  return (
    <div style={{
      width: 44, height: 60, borderRadius: 4, flexShrink: 0,
      background: bg, position: "relative", overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,.12)",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: spine }} />
    </div>
  );
}

// ─── Toast notification ────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isError = type === "error";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: isError ? "#fef2f2" : "#f0fdf4",
      border: `1px solid ${isError ? "#fecaca" : "#bbf7d0"}`,
      borderLeft: `4px solid ${isError ? "#ef4444" : "#22c55e"}`,
      borderRadius: 12, padding: "14px 18px",
      boxShadow: "0 8px 24px rgba(0,0,0,.12)",
      display: "flex", alignItems: "center", gap: 12,
      minWidth: 280, maxWidth: 400,
      animation: "slideIn .25s ease",
      fontFamily: "'Inter', sans-serif",
    }}>
      <span style={{ fontSize: 18 }}>{isError ? "⚠️" : "✅"}</span>
      <p style={{ fontSize: 13, color: isError ? "#b91c1c" : "#15803d", fontWeight: 500, flex: 1 }}>
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: isError ? "#b91c1c" : "#15803d", fontSize: 16, lineHeight: 1,
        }}
      >
        ×
      </button>
      <style>{`@keyframes slideIn { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function UploadSection({ setActivePage }) {
  // ── form state ──────────────────────────────────────────────────────────────
  const [coverFile,     setCoverFile]     = useState(null);
  const [coverPreview,  setCoverPreview]  = useState(null);
  const [coverDragging, setCoverDragging] = useState(false);
  const [pdfFile,       setPdfFile]       = useState(null);

  const [title,       setTitle]       = useState("");
  const [author,      setAuthor]      = useState("");
  const [pubDate,     setPubDate]     = useState("");
  const [language,    setLanguage]    = useState("");
  const [category,    setCategory]    = useState("");
  const [description, setDescription] = useState("");

  // ── toast ───────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null); // { message, type }

  // ── store ───────────────────────────────────────────────────────────────────
  const { upload, loadAll, books, isUploading, isLoadingList, error, successMsg, clearMessages } = useBookStore();

  const coverInputRef = useRef(null);
  const pdfInputRef   = useRef(null);

  // Load recent books for sidebar
  useEffect(() => {
    loadAll();
  }, []);

  // Bubble store messages into toast
  useEffect(() => {
    if (successMsg) {
      setToast({ message: successMsg, type: "success" });
      clearMessages();
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      setToast({ message: error, type: "error" });
      clearMessages();
    }
  }, [error]);

  // ── file handlers ────────────────────────────────────────────────────────────

  const handleCoverFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setCoverFile(file);
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

  // ── reset form ───────────────────────────────────────────────────────────────

  const resetForm = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setPdfFile(null);
    setTitle("");
    setAuthor("");
    setPubDate("");
    setLanguage("");
    setCategory("");
    setDescription("");
  };

  // ── submit ───────────────────────────────────────────────────────────────────

  const allFilled = coverFile && pdfFile && title && author && description && pubDate && language && category;

  const handleSubmit = async () => {
    if (!allFilled || isUploading) return;

    const bookRequest = {
      B_name:        title,
      B_author:      author,
      B_description: description,
      releaseDate:   pubDate,          // "yyyy-MM-dd" — Spring expects Date
      B_Category:    category,
      B_Language:    language,
    };

    const result = await upload({ bookRequest, imageFile: coverFile, pdfFile });
    if (result.success) {
      resetForm();
      loadAll(); // refresh sidebar
    }
  };

  // ── recent books (last 4) ────────────────────────────────────────────────────
  const recentBooks = books.slice(0, 4);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .upload-two-col { display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap; }
        .upload-left    { flex: 1; min-width: 280px; }
        .upload-right   { flex: 1; min-width: 280px; display: flex; flex-direction: column; gap: 16px; }
        .upload-inner   { display: flex; gap: 24px; }
        @media (max-width: 640px) {
          .upload-inner  { flex-direction: column; }
          .upload-cover  { width: 100% !important; }
          .upload-footer { flex-direction: column; align-items: flex-start; gap: 10px; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Page heading ─────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", letterSpacing: "-.4px" }}>
          Upload New Book
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
          Contribute to our growing digital collection and share knowledge.
        </p>
      </div>

      {/* ── Two-column layout ─────────────────────────── */}
      <div className="upload-two-col">

        {/* ── LEFT card ──────────────────────────────────── */}
        <div className="upload-left" style={{
          background: "#fff", borderRadius: 16,
          border: "1px solid #e2e8f0", padding: 24,
          boxShadow: "0 1px 8px rgba(0,0,0,.06)",
        }}>
          <div className="upload-inner">

            {/* Book Cover drop-zone */}
            <div className="upload-cover" style={{ flexShrink: 0, width: 200 }}>
              <p style={labelStyle}>Book Cover</p>
              <div
                onDragOver={(e) => { e.preventDefault(); setCoverDragging(true); }}
                onDragLeave={() => setCoverDragging(false)}
                onDrop={onCoverDrop}
                onClick={() => coverInputRef.current?.click()}
                style={{
                  position: "relative", cursor: "pointer", borderRadius: 12,
                  border: `2px dashed ${coverDragging ? "#0d9488" : "#cbd5e1"}`,
                  background: coverDragging ? "#f0fdfa" : "#f8fafc",
                  height: 260, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  overflow: "hidden", transition: "border-color .2s, background .2s",
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
                      background: "#0d9488", color: "#fff", border: "none", borderRadius: 20,
                      padding: "6px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(13,148,136,.35)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Select Image
                  </button>
                </div>
              </div>
              <input
                ref={coverInputRef} type="file" accept="image/png,image/jpeg"
                style={{ display: "none" }}
                onChange={(e) => handleCoverFile(e.target.files[0])}
              />
            </div>

            {/* Right: Document + Details */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

              {/* PDF upload */}
              <div>
                <p style={labelStyle}>Book Document</p>
                <div style={{
                  border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 12, background: "#f8fafc",
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
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {pdfFile.name}
                        </p>
                        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
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
                      border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#fff",
                      color: "#475569", padding: "5px 14px", fontSize: 12, fontWeight: 600,
                      cursor: "pointer", flexShrink: 0, fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Choose
                  </button>
                </div>
                <input
                  ref={pdfInputRef} type="file" accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => handlePdfFile(e.target.files[0])}
                />
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

                  {/* Category */}
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="" disabled>Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

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
                      {LANGUAGES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer bar */}
          <div className="upload-footer" style={{
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
              disabled={!allFilled || isUploading}
              onClick={handleSubmit}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: allFilled && !isUploading ? "#f97316" : "#fdba74",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "10px 24px", fontSize: 13, fontWeight: 700,
                cursor: allFilled && !isUploading ? "pointer" : "not-allowed",
                fontFamily: "'Inter', sans-serif",
                boxShadow: allFilled && !isUploading ? "0 4px 14px rgba(249,115,22,.3)" : "none",
                transition: "background .2s, box-shadow .2s",
                minWidth: 140,
              }}
            >
              {isUploading ? (
                <>
                  <span style={{
                    width: 14, height: 14, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,.4)",
                    borderTop: "2px solid #fff",
                    display: "inline-block",
                    animation: "spin .7s linear infinite",
                  }} />
                  Uploading...
                </>
              ) : (
                <>
                  Publish Book
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT sidebar ─────────────────────────────── */}
        <div className="upload-right">

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

            {recentBooks.length === 0 ? (
              <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "16px 0" }}>
                No books yet.
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                {recentBooks.map((book, i) => (
                  <li key={book.b_id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <BookThumb book={book} index={i} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {book.b_name}
                      </p>
                      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>by {book.b_author}</p>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: 10, fontWeight: 700, letterSpacing: ".06em",
                        color: STATUS_COLOR["LIVE"], marginTop: 3,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_DOT_BG["LIVE"], display: "inline-block" }} />
                        LIVE
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pro-Tip card */}
          <div style={{
            background: "#f0fdfa", border: "1px solid #ccfbf1",
            borderRadius: 16, padding: 16, boxShadow: "0 1px 8px rgba(0,0,0,.04)",
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

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
  boxSizing: "border-box",
};