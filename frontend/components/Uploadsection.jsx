"use client";

import { useState, useRef, useEffect } from "react";
import useBookStore from "@/store/usebookstore";

const STATUS_COLOR  = { LIVE: "#16a34a" };
const STATUS_DOT_BG = { LIVE: "#22c55e" };

const CATEGORIES = [
  "ALL","Fiction", "Non-Fiction", "Science", "Technology", "kids",
  "Biography",
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

const SPINE_COLORS = ["#134e4a", "#022c22", "#065f46", "#1e40af", "#7c3aed", "#991b1b"];
const BG_COLORS    = ["#fefce8", "#f0fdfa", "#ecfdf5", "#eff6ff", "#f5f3ff", "#fff1f2"];


function BookThumb({ book, index = 0, size = 44 }) {
  if (book.b_imageUrl) {
    return (
      <div style={{
        width: size, height: Math.round(size * 1.36), borderRadius: 4, flexShrink: 0,
        overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.15)",
      }}>
        <img src={book.b_imageUrl} alt={book.b_name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  const bg    = BG_COLORS[index % BG_COLORS.length];
  const spine = SPINE_COLORS[index % SPINE_COLORS.length];
  return (
    <div style={{
      width: size, height: Math.round(size * 1.36), borderRadius: 4, flexShrink: 0,
      background: bg, position: "relative", overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,.12)",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: spine }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

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
      animation: "toastIn .25s ease",
      fontFamily: "sans-serif",
    }}>
      <span style={{ fontSize: 18 }}>{isError ? "???" : "???"}</span>
      <p style={{ fontSize: 13, color: isError ? "#b91c1c" : "#15803d", fontWeight: 500, flex: 1 }}>
        {message}
      </p>
      <button onClick={onClose}
        style={{ background: "none", border: "none", cursor: "pointer",
          color: isError ? "#b91c1c" : "#15803d", fontSize: 18, lineHeight: 1 }}>
        x
      </button>
    </div>
  );
}


function Modal({ onClose, children, width = 520 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, animation: "fadeIn .18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, width: "100%", maxWidth: width,
          boxShadow: "0 24px 64px rgba(0,0,0,.18)",
          maxHeight: "90vh", overflowY: "auto",
          animation: "slideUp .22s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}


function PreviewModal({ book, onClose }) {
  return (
    <Modal onClose={onClose} width={560}>
      <div style={{ padding: 28 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0, maxWidth: "80%" }}>
            Book Preview
          </h2>
          <button onClick={onClose}
            style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32,
              cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            x
          </button>
        </div>

        {/* Book info */}
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <BookThumb book={book} index={0} size={80} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 17, fontWeight: 800, color: "#1e293b", marginBottom: 4 }}>{book.b_name}</p>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>by {book.b_author}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {book.b_category && (
                <span style={{ fontSize: 11, fontWeight: 600, background: "#f0fdfa", color: "#0d9488",
                  border: "1px solid #ccfbf1", borderRadius: 20, padding: "3px 10px" }}>
                  {book.b_category}
                </span>
              )}
              {book.b_language && (
                <span style={{ fontSize: 11, fontWeight: 600, background: "#f8fafc", color: "#475569",
                  border: "1px solid #e2e8f0", borderRadius: 20, padding: "3px 10px" }}>
                  {book.b_language}
                </span>
              )}
              {book.releaseDate && (
                <span style={{ fontSize: 11, fontWeight: 600, background: "#fefce8", color: "#ca8a04",
                  border: "1px solid #fef08a", borderRadius: 20, padding: "3px 10px" }}>
                  {new Date(book.releaseDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {book.b_description && (
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase",
              color: "#94a3b8", marginBottom: 8 }}>Description</p>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>{book.b_description}</p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          {book.b_imageUrl && (
            <a href={book.b_imageUrl} target="_blank" rel="noreferrer"
              style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10,
                background: "#f1f5f9", color: "#475569", fontSize: 13, fontWeight: 600,
                textDecoration: "none", border: "1px solid #e2e8f0" }}>
              View Cover
            </a>
          )}
          {book.b_pdfUrl && (
            <a href={book.b_pdfUrl} target="_blank" rel="noreferrer"
              style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10,
                background: "#0d9488", color: "#fff", fontSize: 13, fontWeight: 600,
                textDecoration: "none", boxShadow: "0 4px 12px rgba(13,148,136,.25)" }}>
              Open PDF
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirm Modal
// ---------------------------------------------------------------------------

function DeleteModal({ book, onConfirm, onClose, isDeleting }) {
  return (
    <Modal onClose={onClose} width={420}>
      <div style={{ padding: 28, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>
          Delete this book?
        </h3>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
          <strong style={{ color: "#1e293b" }}>{book.b_name}</strong>
        </p>
        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 24 }}>
          This will permanently delete the book, its cover image, and PDF from Cloudinary. This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #e2e8f0",
              background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "sans-serif" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting}
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
              background: isDeleting ? "#fca5a5" : "#ef4444", color: "#fff",
              fontSize: 13, fontWeight: 700, cursor: isDeleting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontFamily: "sans-serif" }}>
            {isDeleting ? (
              <>
                <span style={{ width: 12, height: 12, borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid #fff",
                  display: "inline-block", animation: "spin .7s linear infinite" }} />
                Deleting...
              </>
            ) : "Yes, Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Update Modal
// ---------------------------------------------------------------------------

function UpdateModal({ book, onClose, onSuccess }) {
  const { update, isUploading } = useBookStore();

  const [title,       setTitle]       = useState(book.b_name        || "");
  const [author,      setAuthor]      = useState(book.b_author       || "");
  const [description, setDescription] = useState(book.b_description  || "");
  const [category,    setCategory]    = useState(book.b_category     || "");
  const [language,    setLanguage]    = useState(book.b_language     || "");
  const [pubDate,     setPubDate]     = useState(
    book.releaseDate ? new Date(book.releaseDate).toISOString().split("T")[0] : ""
  );
  const [newImageFile, setNewImageFile] = useState(null);
  const [newPdfFile,   setNewPdfFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(book.b_imageUrl || null);

  const imageRef = useRef(null);
  const pdfRef   = useRef(null);

  const handleImageChange = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setNewImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const bookId = book.b_id ?? null;
    if (!bookId) return;

    const bookRequest = {
      B_name:        title,
      B_author:      author,
      B_description: description,
      releaseDate:   pubDate,
      B_Category:    category,
      B_Language:    language,
    };

    const result = await update(bookId, {
      bookRequest,
      imageFile: newImageFile || null,
      pdfFile:   newPdfFile   || null,
    });

    if (result.success) {
      if (onSuccess) onSuccess();
      else onClose();
    }
  };

  return (
    <Modal onClose={onClose} width={540}>
      <div style={{ padding: 28 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>Update Book</h2>
          <button onClick={onClose}
            style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32,
              cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            x
          </button>
        </div>

        {/* Cover swap */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
          <div style={{ position: "relative", cursor: "pointer" }}
            onClick={() => imageRef.current?.click()}>
            <div style={{ width: 72, height: 98, borderRadius: 8, overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,.12)", border: "2px dashed #e2e8f0" }}>
              {imagePreview
                ? <img src={imagePreview} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", background: "#f8fafc",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 22 }}>+</div>
              }
            </div>
            <div style={{ position: "absolute", bottom: -6, right: -6, background: "#0d9488", borderRadius: "50%",
              width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(13,148,136,.4)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <input ref={imageRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => handleImageChange(e.target.files[0])} />
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <input placeholder="Book Title" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
            <input placeholder="Author Name" value={author} onChange={(e) => setAuthor(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <textarea placeholder="Description" value={description}
            onChange={(e) => setDescription(e.target.value)} rows={3}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />

          <select value={category} onChange={(e) => setCategory(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="" disabled>Select Category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <div style={{ display: "flex", gap: 10 }}>
            <input type="date" value={pubDate} onChange={(e) => setPubDate(e.target.value)}
              style={{ ...inputStyle, flex: 1 }} />
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              style={{ ...inputStyle, flex: 1, cursor: "pointer" }}>
              <option value="" disabled>Language</option>
              {LANGUAGES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          {/* Optional new PDF */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 10, background: "#f8fafc" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span style={{ flex: 1, fontSize: 12, color: newPdfFile ? "#1e293b" : "#94a3b8" }}>
              {newPdfFile ? newPdfFile.name : "Replace PDF (optional)"}
            </span>
            <button onClick={() => pdfRef.current?.click()}
              style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#fff",
                color: "#475569", padding: "4px 12px", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "sans-serif" }}>
              Choose
            </button>
            <input ref={pdfRef} type="file" accept="application/pdf" style={{ display: "none" }}
              onChange={(e) => setNewPdfFile(e.target.files[0] || null)} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #e2e8f0",
              background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "sans-serif" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isUploading}
            style={{ flex: 2, padding: "10px 0", borderRadius: 10, border: "none",
              background: isUploading ? "#a5f3fc" : "#0d9488", color: "#fff",
              fontSize: 13, fontWeight: 700, cursor: isUploading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "sans-serif", boxShadow: "0 4px 12px rgba(13,148,136,.25)" }}>
            {isUploading ? (
              <>
                <span style={{ width: 12, height: 12, borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid #fff",
                  display: "inline-block", animation: "spin .7s linear infinite" }} />
                Saving...
              </>
            ) : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main UploadSection
// ---------------------------------------------------------------------------

export default function UploadSection({ setActivePage }) {
  // Upload form state
  const [coverFile,     setCoverFile]     = useState(null);
  const [coverPreview,  setCoverPreview]  = useState(null);
  const [coverDragging, setCoverDragging] = useState(false);
  const [pdfFile,       setPdfFile]       = useState(null);
  const [title,         setTitle]         = useState("");
  const [author,        setAuthor]        = useState("");
  const [pubDate,       setPubDate]       = useState("");
  const [language,      setLanguage]      = useState("");
  const [category,      setCategory]      = useState("");
  const [description,   setDescription]   = useState("");

  // Modal state
  const [previewBook, setPreviewBook] = useState(null);
  const [updateBook,  setUpdateBook]  = useState(null);
  const [deleteBook,  setDeleteBook]  = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const { upload, remove, loadAll, books, isUploading, isLoadingList, error, successMsg, clearMessages } = useBookStore();

  const coverInputRef = useRef(null);
  const pdfInputRef   = useRef(null);

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (successMsg) { setToast({ message: successMsg, type: "success" }); clearMessages(); }
  }, [successMsg]);

  useEffect(() => {
    if (error) { setToast({ message: error, type: "error" }); clearMessages(); }
  }, [error]);

  const handleCoverFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setCoverFile(null); setCoverPreview(null); setPdfFile(null);
    setTitle(""); setAuthor(""); setPubDate(""); setLanguage(""); setCategory(""); setDescription("");
  };

  const allFilled = coverFile && pdfFile && title && author && description && pubDate && language && category;

  const handleSubmit = async () => {
    if (!allFilled || isUploading) return;
    const result = await upload({
      bookRequest: { B_name: title, B_author: author, B_description: description,
        releaseDate: pubDate, B_Category: category, B_Language: language },
      imageFile: coverFile,
      pdfFile,
    });
    if (result.success) { resetForm(); loadAll(); }
  };

  const handleDelete = async () => {
    if (!deleteBook) return;
    const id = deleteBook.b_id ?? null;
    if (!id) return;
    const result = await remove(id);
    if (result.success) { setDeleteBook(null); loadAll(); }
  };

  const recentBooks = books.slice(0, 6);

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <style>{`
        .upload-two-col { display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap; }
        .upload-left    { flex: 1; min-width: 280px; }
        .upload-right   { flex: 1; min-width: 280px; display: flex; flex-direction: column; gap: 16px; }
        .upload-inner   { display: flex; gap: 24px; }

        @media (max-width: 640px) {
          .upload-inner { flex-direction: column; }
          .upload-cover { width: 100% !important; }
          .upload-footer { flex-direction: column; align-items: flex-start; gap: 10px; }
          .book-actions { display: flex; }
        }
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes fadeIn   { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp  { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes toastIn  { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* Modals */}
      {previewBook && <PreviewModal book={previewBook} onClose={() => setPreviewBook(null)} />}
      {updateBook  && <UpdateModal  book={updateBook}  onClose={() => setUpdateBook(null)} onSuccess={() => { setUpdateBook(null); loadAll(); }} />}
      {deleteBook  && (
        <DeleteModal
          book={deleteBook}
          onConfirm={handleDelete}
          onClose={() => setDeleteBook(null)}
          isDeleting={isUploading}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page heading */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", letterSpacing: "-.4px" }}>
          Upload New Book
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
          Contribute to our growing digital collection and share knowledge.
        </p>
      </div>

      <div className="upload-two-col">

        {/* LEFT card */}
        <div className="upload-left" style={{ background: "#fff", borderRadius: 16,
          border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,.06)" }}>
          <div className="upload-inner">

            {/* Cover drop-zone */}
            <div className="upload-cover" style={{ flexShrink: 0, width: 200 }}>
              <p style={labelStyle}>Book Cover</p>
              <div
                onDragOver={(e) => { e.preventDefault(); setCoverDragging(true); }}
                onDragLeave={() => setCoverDragging(false)}
                onDrop={(e) => { e.preventDefault(); setCoverDragging(false); handleCoverFile(e.dataTransfer.files[0]); }}
                onClick={() => coverInputRef.current?.click()}
                style={{ position: "relative", cursor: "pointer", borderRadius: 12,
                  border: `2px dashed ${coverDragging ? "#0d9488" : "#cbd5e1"}`,
                  background: coverDragging ? "#f0fdfa" : "#f8fafc",
                  height: 260, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  overflow: "hidden", transition: "border-color .2s, background .2s" }}
              >
                {coverPreview
                  ? <img src={coverPreview} alt="preview"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingBottom: 48 }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Drop your cover here</p>
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>PNG, JPG up to 5MB</p>
                    </div>
                  )
                }
                <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)" }}>
                  <button onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }}
                    style={{ background: "#0d9488", color: "#fff", border: "none", borderRadius: 20,
                      padding: "6px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(13,148,136,.35)", fontFamily: "sans-serif" }}>
                    Select Image
                  </button>
                </div>
              </div>
              <input ref={coverInputRef} type="file" accept="image/png,image/jpeg"
                style={{ display: "none" }} onChange={(e) => handleCoverFile(e.target.files[0])} />
            </div>

            {/* Details */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

              {/* PDF */}
              <div>
                <p style={labelStyle}>Book Document</p>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 12, background: "#f8fafc" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fee2e2",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {pdfFile
                      ? <>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pdfFile.name}</p>
                          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{(pdfFile.size / (1024*1024)).toFixed(2)} MB</p>
                        </>
                      : <>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>PDF File</p>
                          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Max size: 50MB</p>
                        </>
                    }
                  </div>
                  <button onClick={() => pdfInputRef.current?.click()}
                    style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#fff",
                      color: "#475569", padding: "5px 14px", fontSize: 12, fontWeight: 600,
                      cursor: "pointer", flexShrink: 0, fontFamily: "sans-serif" }}>
                    Choose
                  </button>
                </div>
                <input ref={pdfInputRef} type="file" accept="application/pdf"
                  style={{ display: "none" }} onChange={(e) => setPdfFile(e.target.files[0] || null)} />
              </div>

              {/* Form fields */}
              <div>
                <p style={labelStyle}>Details</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input placeholder="Book Title" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
                  <input placeholder="Author Name" value={author} onChange={(e) => setAuthor(e.target.value)} style={inputStyle} />
                  <textarea placeholder="Book Description" value={description}
                    onChange={(e) => setDescription(e.target.value)} rows={3}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="" disabled>Select Category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input type="date" value={pubDate} onChange={(e) => setPubDate(e.target.value)}
                      style={{ ...inputStyle, flex: 1 }} />
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}
                      style={{ ...inputStyle, flex: 1, cursor: "pointer" }}>
                      <option value="" disabled>Language</option>
                      {LANGUAGES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="upload-footer" style={{ marginTop: 24, paddingTop: 20,
            borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              All fields are required before publishing.
            </p>
            <button disabled={!allFilled || isUploading} onClick={handleSubmit}
              style={{ display: "flex", alignItems: "center", gap: 8,
                background: allFilled && !isUploading ? "#f97316" : "#fdba74",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "10px 24px", fontSize: 13, fontWeight: 700,
                cursor: allFilled && !isUploading ? "pointer" : "not-allowed",
                fontFamily: "sans-serif",
                boxShadow: allFilled && !isUploading ? "0 4px 14px rgba(249,115,22,.3)" : "none",
                transition: "background .2s, box-shadow .2s", minWidth: 140 }}>
              {isUploading ? (
                <>
                  <span style={{ width: 14, height: 14, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid #fff",
                    display: "inline-block", animation: "spin .7s linear infinite" }} />
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

        {/* RIGHT sidebar */}
        <div className="upload-right">

          {/* Recently Uploaded */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0",
            padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Recently Uploaded</h2>
              <button onClick={() => setActivePage && setActivePage("Catalog")}
                style={{ fontSize: 12, fontWeight: 600, color: "#0d9488", background: "none",
                  border: "none", cursor: "pointer", fontFamily: "sans-serif" }}>
                View All
              </button>
            </div>

            {isLoadingList ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[1,2,3].map((n) => (
                  <div key={n} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 44, height: 60, borderRadius: 4, background: "#f1f5f9", animation: "pulse 1.5s infinite" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 12, background: "#f1f5f9", borderRadius: 6, marginBottom: 6, width: "70%" }} />
                      <div style={{ height: 10, background: "#f8fafc", borderRadius: 6, width: "50%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentBooks.length === 0 ? (
              <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "16px 0" }}>
                No books yet.
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {recentBooks.map((book, i) => (
                  <li key={book.b_id ?? book.id ?? i}
                    style={{ borderRadius: 12, border: "1px solid #f1f5f9",
                      background: "#fafafa", overflow: "hidden",
                      transition: "box-shadow .15s, border-color .15s" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.08)";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "#f1f5f9";
                    }}
                  >
                    {/* Top row: thumb + info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 12px 8px" }}>
                      <BookThumb book={book} index={i} size={40} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {book.b_name}
                        </p>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
                          by {book.b_author}
                        </p>
                      </div>
                      {/* LIVE badge */}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: 10, fontWeight: 700, letterSpacing: ".06em",
                        color: "#16a34a", background: "#f0fdf4",
                        border: "1px solid #bbf7d0", borderRadius: 20,
                        padding: "2px 8px", flexShrink: 0 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%",
                          background: "#22c55e", display: "inline-block" }} />
                        LIVE
                      </span>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: "#f1f5f9", margin: "0 12px" }} />

                    {/* Action buttons row — always visible */}
                    <div style={{ display: "flex", padding: "8px 10px", gap: 6 }}>

                      {/* Preview */}
                      <button
                        onClick={() => setPreviewBook(book)}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                          gap: 5, padding: "6px 0", borderRadius: 8, border: "1px solid #ccfbf1",
                          background: "#f0fdfa", color: "#0d9488", fontSize: 11, fontWeight: 600,
                          cursor: "pointer", fontFamily: "sans-serif", transition: "background .15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#ccfbf1"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#f0fdfa"}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Preview
                      </button>

                      {/* Update */}
                      <button
                        onClick={() => setUpdateBook(book)}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                          gap: 5, padding: "6px 0", borderRadius: 8, border: "1px solid #dbeafe",
                          background: "#eff6ff", color: "#3b82f6", fontSize: 11, fontWeight: 600,
                          cursor: "pointer", fontFamily: "sans-serif", transition: "background .15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#dbeafe"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#eff6ff"}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Update
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteBook(book)}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                          gap: 5, padding: "6px 0", borderRadius: 8, border: "1px solid #fecaca",
                          background: "#fef2f2", color: "#ef4444", fontSize: 11, fontWeight: 600,
                          cursor: "pointer", fontFamily: "sans-serif", transition: "background .15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#fecaca"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#fef2f2"}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        Delete
                      </button>

                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pro-Tip */}
          <div style={{ background: "#f0fdfa", border: "1px solid #ccfbf1",
            borderRadius: 16, padding: 16, boxShadow: "0 1px 8px rgba(0,0,0,.04)" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#0d9488",
              display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
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

const labelStyle = {
  fontSize: 10, fontWeight: 700, letterSpacing: ".1em",
  textTransform: "uppercase", color: "#94a3b8",
  marginBottom: 10, display: "block",
};

const inputStyle = {
  width: "100%", padding: "10px 14px",
  border: "1px solid #e2e8f0", borderRadius: 10,
  fontSize: 13, color: "#1e293b", background: "#fff",
  outline: "none", fontFamily: "sans-serif",
  boxSizing: "border-box",
};