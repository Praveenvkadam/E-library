import axios from "axios";
import { getToken } from "@/store/authstore";
import useAuthStore from "@/store/authstore";


const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BOOK_API_URL || "http://localhost:8081",
  timeout: 60000,
});


api.interceptors.request.use((config) => {
  const token = getToken();
  const user  = useAuthStore.getState().user;

  if (token) {
    config.headers["Authorization"] = "Bearer " + token;
  }

  if (user) {
    config.headers["X-User-Id"]    = String(user.id    ?? "");
    config.headers["X-User-Email"] = String(user.email ?? "");
    config.headers["X-User-Name"]  = String(user.name  ?? user.username ?? "");
    config.headers["X-User-Roles"] = user.role ? "ROLE_" + user.role : "";
  }

  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — surface real Spring Boot error message
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response.data,

  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data   = error.response.data;

      const msg =
        (typeof data === "string" && data) ? data         :
        data?.message                      ? data.message :
        data?.error                        ? data.error   :
        "Server error " + status;

      return Promise.reject(new Error(msg));

    } else if (error.request) {
      const url = (error.config?.baseURL || "") + (error.config?.url || "");
      return Promise.reject(new Error(
        "No response from server. URL: " + url + " — check Spring Boot is running on port 8081"
      ));

    } else {
      return Promise.reject(new Error(error.message));
    }
  }
);

// ---------------------------------------------------------------------------
// Upload Book — POST /api/books/upload
// ---------------------------------------------------------------------------
export async function uploadBook({ bookRequest, imageFile, pdfFile }) {
  const formData = new FormData();
  formData.append("bookName",        bookRequest.B_name);
  formData.append("bookAuthor",      bookRequest.B_author);
  formData.append("bookDescription", bookRequest.B_description);
  formData.append("releaseDate",     bookRequest.releaseDate);
  formData.append("bookCategory",    bookRequest.B_Category);
  formData.append("bookLanguage",    bookRequest.B_Language);
  formData.append("imageFile",       imageFile);
  formData.append("pdfFile",         pdfFile);

  // Do NOT set Content-Type manually — browser sets it with the correct boundary
  return api.post("/api/books/upload", formData);
}

// ---------------------------------------------------------------------------
// Update Book — PUT /api/books/{id}
// ---------------------------------------------------------------------------
export async function updateBook({ bookId, bookRequest, imageFile, pdfFile }) {
  if (!bookId || bookId === "null" || bookId === "undefined") {
    return Promise.reject(new Error("Book ID is missing — cannot update."));
  }

  const formData = new FormData();
  formData.append("bookName",        bookRequest.B_name);
  formData.append("bookAuthor",      bookRequest.B_author);
  formData.append("bookDescription", bookRequest.B_description);
  formData.append("releaseDate",     bookRequest.releaseDate);
  formData.append("bookCategory",    bookRequest.B_Category);
  formData.append("bookLanguage",    bookRequest.B_Language);
  if (imageFile) formData.append("imageFile", imageFile);
  if (pdfFile)   formData.append("pdfFile",   pdfFile);

  // Do NOT set Content-Type manually
  return api.put("/api/books/" + bookId, formData);
}

// ---------------------------------------------------------------------------
// Delete Book — DELETE /api/books/{id}
// ---------------------------------------------------------------------------
export async function deleteBook(bookId) {
  if (!bookId || bookId === "null" || bookId === "undefined") {
    return Promise.reject(new Error("Book ID is missing — cannot delete."));
  }
  return api.delete("/api/books/" + bookId);
}

// ---------------------------------------------------------------------------
// Get All Books — GET /api/books
// ---------------------------------------------------------------------------
export async function fetchAllBooks() {
  return api.get("/api/books");
}

// ---------------------------------------------------------------------------
// Search Books — GET /api/books/search
// ---------------------------------------------------------------------------
export async function searchBooks({
  B_name, B_author, releaseDate, B_Category, B_Language
} = {}) {
  return api.get("/api/books/search", {
    params: {
      ...(B_name      && { B_name }),
      ...(B_author    && { B_author }),
      ...(releaseDate && { releaseDate }),
      ...(B_Category  && { B_Category }),
      ...(B_Language  && { B_Language }),
    },
  });
}