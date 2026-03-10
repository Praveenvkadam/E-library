import { create } from "zustand";
import {
  uploadBook,
  updateBook,
  deleteBook,
  fetchAllBooks,
  searchBooks,
} from "@/lib/bookapi";

// ---------------------------------------------------------------------------
// normalizeBook
// Maps the raw API response (using @JsonProperty names from BookResponce.java)
// to a consistent internal shape used throughout the UI.
//
// BookResponce @JsonProperty → internal field
//   "id"          → b_id
//   "name"        → b_name
//   "author"      → b_author
//   "description" → b_description
//   "imageUrl"    → b_imageUrl
//   "pdfUrl"      → b_pdfUrl
//   "releaseDate" → releaseDate
//   "category"    → b_category
//   "language"    → b_language
// ---------------------------------------------------------------------------
function normalizeBook(raw) {
  if (!raw) return null;
  return {
    b_id:          raw.id          ?? null,
    b_name:        raw.name        ?? "",
    b_author:      raw.author      ?? "",
    b_description: raw.description ?? "",
    b_imageUrl:    raw.imageUrl    ?? null,
    b_pdfUrl:      raw.pdfUrl      ?? null,
    releaseDate:   raw.releaseDate ?? null,
    b_category:    raw.category    ?? "",
    b_language:    raw.language    ?? "",
  };
}

function normalizeList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeBook).filter(Boolean);
}

// ---------------------------------------------------------------------------
const useBookStore = create((set) => ({

  // --- state ----------------------------------------------------------------
  books:         [],
  selectedBook:  null,
  isUploading:   false,   // upload / update / delete spinner
  isLoadingList: false,   // sidebar / catalog loading
  error:         null,
  successMsg:    null,

  // --- helpers --------------------------------------------------------------
  clearMessages: () => set({ error: null, successMsg: null }),
  selectBook:    (book) => set({ selectedBook: book }),
  clearSelected: () => set({ selectedBook: null }),

  // --- upload ---------------------------------------------------------------
  upload: async ({ bookRequest, imageFile, pdfFile }) => {
    set({ isUploading: true, error: null, successMsg: null });
    try {
      const newBook = normalizeBook(await uploadBook({ bookRequest, imageFile, pdfFile }));
      set((s) => ({
        books:       [newBook, ...s.books],
        isUploading: false,
        successMsg:  `"${newBook.b_name || "Book"}" uploaded successfully!`,
      }));
      return { success: true, book: newBook };
    } catch (err) {
      set({ error: err.message, isUploading: false });
      return { success: false, error: err.message };
    }
  },

  // --- update ---------------------------------------------------------------
  update: async (bookId, { bookRequest, imageFile, pdfFile }) => {
    set({ isUploading: true, error: null, successMsg: null });
    try {
      const updated = normalizeBook(await updateBook({ bookId, bookRequest, imageFile, pdfFile }));
      set((s) => ({
        books:        s.books.map((b) => (b.b_id === bookId ? updated : b)),
        selectedBook: null,
        isUploading:  false,
        successMsg:   `"${updated.b_name || "Book"}" updated successfully!`,
      }));
      return { success: true, book: updated };
    } catch (err) {
      set({ error: err.message, isUploading: false });
      return { success: false, error: err.message };
    }
  },

  // --- delete ---------------------------------------------------------------
  remove: async (bookId) => {
    set({ isUploading: true, error: null, successMsg: null });
    try {
      const deleted = normalizeBook(await deleteBook(bookId));
      set((s) => ({
        books:       s.books.filter((b) => b.b_id !== bookId),
        isUploading: false,
        successMsg:  `"${deleted?.b_name || "Book"}" deleted.`,
      }));
      return { success: true };
    } catch (err) {
      set({ error: err.message, isUploading: false });
      return { success: false, error: err.message };
    }
  },

  // --- load all -------------------------------------------------------------
  loadAll: async () => {
    set({ isLoadingList: true, error: null });
    try {
      const books = normalizeList(await fetchAllBooks());
      set({ books, isLoadingList: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoadingList: false });
      return { success: false, error: err.message };
    }
  },

  // --- search ---------------------------------------------------------------
  search: async (filters = {}) => {
    set({ isLoadingList: true, error: null });
    try {
      const books = normalizeList(await searchBooks(filters));
      set({ books, isLoadingList: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoadingList: false });
      return { success: false, error: err.message };
    }
  },
}));

export default useBookStore;