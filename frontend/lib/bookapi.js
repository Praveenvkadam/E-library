import axios from "axios";
import { getToken } from "@/store/authstore";
import useAuthStore from "@/store/authstore";



const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BOOK_API_URL || "http://localhost:8081",
  timeout: 60000,
});

// --- Request interceptor: attach JWT + X-User-* headers ---------------------

api.interceptors.request.use((config) => {
  const token = getToken();
  const user = useAuthStore.getState().user;

  if (token) {
    config.headers["Authorization"] = "Bearer " + token;
  }

  if (user) {
    config.headers["X-User-Id"]    = String(user.id    ?? "");
    config.headers["X-User-Email"] = String(user.email ?? "");
    config.headers["X-User-Name"]  = String(user.name  ?? user.username ?? "");
    config.headers["X-User-Roles"] = user.role ? "ROLE_" + user.role : "";
  }

  console.log("[bookApi] request ->", config.method?.toUpperCase(), config.url);
  console.log("[bookApi] headers ->", {
    hasToken:       !!config.headers["Authorization"],
    "X-User-Id":    config.headers["X-User-Id"],
    "X-User-Email": config.headers["X-User-Email"],
    "X-User-Roles": config.headers["X-User-Roles"],
  });

  return config;
});

// --- Response interceptor: surface real Spring Boot error message -----------

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

      console.error("[bookApi] " + status + " -- " + msg);
      return Promise.reject(new Error(msg));

    } else if (error.request) {
      console.error("[bookApi] No response -- is Spring Boot running?");
      return Promise.reject(new Error("No response from server -- check Spring Boot is running on port 8081"));

    } else {
      console.error("[bookApi] Request error:", error.message);
      return Promise.reject(new Error(error.message));
    }
  }
);

// --- Upload Book: POST /api/books/upload ------------------------------------

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

  console.log("[bookApi] FormData ->", {
    bookName:        bookRequest.B_name,
    bookAuthor:      bookRequest.B_author,
    bookDescription: bookRequest.B_description,
    releaseDate:     bookRequest.releaseDate,
    bookCategory:    bookRequest.B_Category,
    bookLanguage:    bookRequest.B_Language,
    imageFile:       imageFile?.name,
    pdfFile:         pdfFile?.name,
  });

  return api.post("/api/books/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// --- Update Book: PUT /api/books/{id} ---------------------------------------

export async function updateBook({ bookId, bookRequest, imageFile, pdfFile }) {
  const formData = new FormData();
  formData.append("bookName",        bookRequest.B_name);
  formData.append("bookAuthor",      bookRequest.B_author);
  formData.append("bookDescription", bookRequest.B_description);
  formData.append("releaseDate",     bookRequest.releaseDate);
  formData.append("bookCategory",    bookRequest.B_Category);
  formData.append("bookLanguage",    bookRequest.B_Language);
  if (imageFile) formData.append("imageFile", imageFile);
  if (pdfFile)   formData.append("pdfFile",   pdfFile);

  return api.put("/api/books/" + bookId, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// --- Delete Book: DELETE /api/books/{id} ------------------------------------

export async function deleteBook(bookId) {
  return api.delete("/api/books/" + bookId);
}

// --- Get All Books: GET /api/books ------------------------------------------

export async function fetchAllBooks() {
  return api.get("/api/books");
}

// --- Search Books: GET /api/books/search ------------------------------------

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