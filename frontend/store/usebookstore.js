import { create } from "zustand";
import {
  uploadBook,
  updateBook,
  deleteBook,
  fetchAllBooks,
  searchBooks,
} from "@/lib/bookapi";

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

function normalizeList(raw) {
  let list = raw;
  if (raw && !Array.isArray(raw)) {
    list = raw.content ?? raw.books ?? raw.data ?? raw.items ?? [];
  }
  if (!Array.isArray(list)) {
    console.warn("[BookStore] Unexpected API response shape:", raw);
    return [];
  }
  return list.map(normalizeBook).filter(Boolean);
}

// ✅ set, get both accepted
const useBookStore = create((set, get) => ({

  // --- state ----------------------------------------------------------------
  books:         [],
  selectedBook:  null,
  isUploading:   false,
  isLoadingList: false,
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
    const { isLoadingList, books } = get();

    // ✅ Guard — only fetch if not already loading and no data yet
    if (isLoadingList || books.length > 0) return;

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