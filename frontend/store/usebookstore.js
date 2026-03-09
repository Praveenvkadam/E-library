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
// Handles all possible Jackson serialization variants from Spring Boot:
//   B_name  /  b_name  /  bName  (same for all fields)
// Always produces a consistent lowercase snake_case shape the UI can rely on.
// ---------------------------------------------------------------------------
function normalizeBook(raw) {
  if (!raw) return raw;

  // Debug — remove after confirming field names
  console.log("[useBookStore] raw book from API:", raw);

  return {
    // ID
    b_id:        raw.b_id        ?? raw.B_id        ?? raw.bId        ?? raw.id        ?? null,

    // Text fields
    b_name:      raw.b_name      ?? raw.B_name      ?? raw.bName      ?? raw.name      ?? "",
    b_author:    raw.b_author    ?? raw.B_author    ?? raw.bAuthor    ?? raw.author    ?? "",
    b_description: raw.b_description ?? raw.B_description ?? raw.bDescription ?? raw.description ?? "",

    // Media URLs
    b_imageUrl:  raw.b_imageUrl  ?? raw.B_imageUrl  ?? raw.bImageUrl  ?? raw.imageUrl  ?? null,
    b_pdfUrl:    raw.b_pdfUrl    ?? raw.B_pdfUrl    ?? raw.bPdfUrl    ?? raw.pdfUrl    ?? null,

    // Metadata
    releaseDate: raw.releaseDate ?? raw.ReleaseDate ?? null,
    b_category:  raw.b_category  ?? raw.B_category  ?? raw.B_Category ?? raw.bCategory ?? raw.category  ?? "",
    b_language:  raw.b_language  ?? raw.B_language  ?? raw.B_Language ?? raw.bLanguage ?? raw.language  ?? "",
  };
}

function normalizeList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeBook);
}

// ---------------------------------------------------------------------------

const useBookStore = create((set) => ({
  // --- state -----------------------------------------------------------------
  books:         [],
  selectedBook:  null,
  isUploading:   false,
  isLoadingList: false,
  error:         null,
  successMsg:    null,

  // --- helpers ---------------------------------------------------------------
  clearMessages: () => set({ error: null, successMsg: null }),
  selectBook:    (book) => set({ selectedBook: book }),
  clearSelected: () => set({ selectedBook: null }),

  // --- upload ----------------------------------------------------------------
  upload: async ({ bookRequest, imageFile, pdfFile }) => {
    set({ isUploading: true, error: null, successMsg: null });
    try {
      const raw     = await uploadBook({ bookRequest, imageFile, pdfFile });
      const newBook = normalizeBook(raw);

      set((state) => ({
        books:       [newBook, ...state.books],
        isUploading: false,
        successMsg:  '"' + (newBook.b_name || "Book") + '" uploaded successfully!',
      }));

      return { success: true, book: newBook };
    } catch (err) {
      set({ error: err.message, isUploading: false });
      return { success: false, error: err.message };
    }
  },

  // --- update ----------------------------------------------------------------
  update: async (bookId, { bookRequest, imageFile, pdfFile }) => {
    set({ isUploading: true, error: null, successMsg: null });
    try {
      const raw     = await updateBook({ bookId, bookRequest, imageFile, pdfFile });
      const updated = normalizeBook(raw);

      set((state) => ({
        books:        state.books.map((b) => (b.b_id === bookId ? updated : b)),
        selectedBook: null,
        isUploading:  false,
        successMsg:   '"' + (updated.b_name || "Book") + '" updated successfully!',
      }));

      return { success: true, book: updated };
    } catch (err) {
      set({ error: err.message, isUploading: false });
      return { success: false, error: err.message };
    }
  },

  // --- delete ----------------------------------------------------------------
  remove: async (bookId) => {
    set({ isUploading: true, error: null, successMsg: null });
    try {
      const raw  = await deleteBook(bookId);
      const name = normalizeBook(raw)?.b_name || "Book";

      set((state) => ({
        books:       state.books.filter((b) => b.b_id !== bookId),
        isUploading: false,
        successMsg:  '"' + name + '" deleted.',
      }));

      return { success: true };
    } catch (err) {
      set({ error: err.message, isUploading: false });
      return { success: false, error: err.message };
    }
  },

  // --- load all --------------------------------------------------------------
  loadAll: async () => {
    set({ isLoadingList: true, error: null });
    try {
      const raw   = await fetchAllBooks();
      const books = normalizeList(raw);
      set({ books, isLoadingList: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoadingList: false });
      return { success: false, error: err.message };
    }
  },

  // --- search ----------------------------------------------------------------
  search: async (filters = {}) => {
    set({ isLoadingList: true, error: null });
    try {
      const raw   = await searchBooks(filters);
      const books = normalizeList(raw);
      set({ books, isLoadingList: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoadingList: false });
      return { success: false, error: err.message };
    }
  },
}));

export default useBookStore;