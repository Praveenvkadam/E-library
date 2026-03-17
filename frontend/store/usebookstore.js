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

const useBookStore = create((set, get) => ({

  // --- state ----------------------------------------------------------------
  books:          [],
  selectedBook:   null,
  activeReadBook: null,
  isUploading:    false,
  isLoadingList:  false,
  error:          null,
  successMsg:     null,

  // --- helpers --------------------------------------------------------------
  clearMessages:     () => set({ error: null, successMsg: null }),
  selectBook:        (book) => set({ selectedBook: book }),
  clearSelected:     () => set({ selectedBook: null }),
  setActiveReadBook: (book) => set({ activeReadBook: book }),

  // --- upload ---------------------------------------------------------------
  // The backend returns 202 Accepted (async) with a plain string — not a book
  // object. So we build an optimistic book from the form data immediately and
  // add it to the list. When loadAll() runs next time it will be replaced with
  // the real saved version (with the actual b_id from the DB).
  upload: async ({ bookRequest, imageFile, pdfFile }) => {
    set({ isUploading: true, error: null, successMsg: null });
    try {
      await uploadBook({ bookRequest, imageFile, pdfFile });

      // Build a temporary preview from form data so the right panel updates
      // immediately without waiting for the async backend job to finish.
      const optimisticBook = {
        b_id:          null,           // not yet assigned by DB
        b_name:        bookRequest.B_name        || "Untitled",
        b_author:      bookRequest.B_author      || "Unknown",
        b_description: bookRequest.B_description || "",
        b_imageUrl:    imageFile
                         ? URL.createObjectURL(imageFile)   // local preview
                         : null,
        b_pdfUrl:      null,
        releaseDate:   bookRequest.releaseDate   || null,
        b_category:    bookRequest.B_Category    || "",
        b_language:    bookRequest.B_Language    || "",
        _optimistic:   true,           // flag so we can replace it later
      };

      set((s) => ({
        books:       [optimisticBook, ...s.books],
        isUploading: false,
        successMsg:  `"${optimisticBook.b_name}" uploaded successfully!`,
      }));

      // After a short delay, reload the list from the server so the optimistic
      // entry is replaced with the real saved book (with actual id + URLs).
      setTimeout(() => {
        // Force a fresh fetch by resetting the books list first
        set({ books: [] });
        get().loadAll();
      }, 3000);

      return { success: true, book: optimisticBook };

    } catch (err) {
      set({ error: err.message, isUploading: false });
      return { success: false, error: err.message };
    }
  },

  // --- update ---------------------------------------------------------------
  // Same situation — backend returns 202 string, so update optimistically.
  update: async (bookId, { bookRequest, imageFile, pdfFile }) => {
    set({ isUploading: true, error: null, successMsg: null });
    try {
      await updateBook({ bookId, bookRequest, imageFile, pdfFile });

      set((s) => ({
        books: s.books.map((b) =>
          b.b_id === bookId
            ? {
                ...b,
                b_name:        bookRequest.B_name        || b.b_name,
                b_author:      bookRequest.B_author      || b.b_author,
                b_description: bookRequest.B_description || b.b_description,
                b_imageUrl:    imageFile
                                 ? URL.createObjectURL(imageFile)
                                 : b.b_imageUrl,
                releaseDate:   bookRequest.releaseDate   || b.releaseDate,
                b_category:    bookRequest.B_Category    || b.b_category,
                b_language:    bookRequest.B_Language    || b.b_language,
                _optimistic:   true,
              }
            : b
        ),
        selectedBook: null,
        isUploading:  false,
        successMsg:   `"${bookRequest.B_name || "Book"}" updated successfully!`,
      }));

      // Refresh from server after delay to get real Cloudinary URLs
      setTimeout(() => {
        set({ books: [] });
        get().loadAll();
      }, 3000);

      return { success: true };

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