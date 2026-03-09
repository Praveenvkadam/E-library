import { create } from "zustand";
import {
  uploadBook,
  updateBook,
  deleteBook,
  fetchAllBooks,
  searchBooks,
} from "@/lib/bookapi";

const useBookStore = create((set, get) => ({
  // --- state -----------------------------------------------------------------
  books:        [],
  selectedBook: null,

  isUploading:  false,   // controls Publish button spinner
  isLoadingList: false,  // controls sidebar / catalog loading

  error:      null,
  successMsg: null,

  // --- helpers ---------------------------------------------------------------
  clearMessages: () => set({ error: null, successMsg: null }),
  selectBook:    (book) => set({ selectedBook: book }),
  clearSelected: () => set({ selectedBook: null }),

  // --- upload ----------------------------------------------------------------
  upload: async ({ bookRequest, imageFile, pdfFile }) => {
    set({ isUploading: true, error: null, successMsg: null });
    try {
      const newBook = await uploadBook({ bookRequest, imageFile, pdfFile });

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
      const updated = await updateBook({ bookId, bookRequest, imageFile, pdfFile });

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
      const deleted = await deleteBook(bookId);
      const name = deleted?.b_name || "Book";

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
      const books = await fetchAllBooks();
      set({ books: Array.isArray(books) ? books : [], isLoadingList: false });
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
      const books = await searchBooks(filters);
      set({ books: Array.isArray(books) ? books : [], isLoadingList: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoadingList: false });
      return { success: false, error: err.message };
    }
  },
}));

export default useBookStore;