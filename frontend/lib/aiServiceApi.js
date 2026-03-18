import axios from "axios";
import { getToken } from "@/store/authstore";
import useAuthStore from "@/store/authstore";

const BASE = `${process.env.NEXT_PUBLIC_AI_SERVICE_API_URL}/api/ai`;

// ─── Axios instance ───────────────────────────────────────────────────────────

const aiApi = axios.create({ baseURL: BASE });


aiApi.interceptors.request.use((config) => {
  const token = getToken() || localStorage.getItem("auth-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const user = useAuthStore.getState()?.user;
  if (user) {
    config.headers["X-User-Id"]    = String(user.id    ?? "");
    config.headers["X-User-Email"] = String(user.email ?? "");
    config.headers["X-User-Name"]  = String(user.name  ?? user.username ?? "");
    config.headers["X-User-Roles"] = user.role ? "ROLE_" + user.role : "";
  }

  return config;
});

// Unwrap { success, data } or throw a readable error
aiApi.interceptors.response.use(
  (response) => {
    const json = response.data;
    if (!json.success) throw new Error(json.message || "Request failed");
    return json.data;
  },
  (error) => {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      `Request failed (${error.response?.status ?? "network error"})`;
    return Promise.reject(new Error(msg));
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// ANALYSIS  /analysis/*
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /ai/analysis/sentiment
 * @param {string} text
 * @returns {{ text, sentiment, confidenceScore }}
 */
export const apiAnalyzeSentiment = (text) =>
  aiApi.post("/analysis/sentiment", { text });

/**
 * POST /ai/analysis/genres
 * @param {string} description
 * @returns {{ genres: string[], count: number }}
 */
export const apiExtractGenres = (description) =>
  aiApi.post("/analysis/genres", { description });

/**
 * POST /ai/analysis/interaction
 * @param {{ bookId, title, description, genres?, rating? }} bookData
 * @returns {{ userId, topGenres, totalBooksAnalyzed, overallSentimentScore, latestInteraction }}
 */
export const apiRecordInteraction = (bookData) =>
  aiApi.post("/analysis/interaction", bookData);

/**
 * POST /ai/analysis/recommend
 * @param {Array<{ bookId, title, description, genres }>} books
 * @returns {{ recommendations: object[], basedOn?: object }}
 */
export const apiGetRecommendations = (books) =>
  aiApi.post("/analysis/recommend", { books });

/**
 * GET /ai/analysis/profile
 * @returns {{ userId, topGenres, genreScores, overallSentimentScore, totalBooksAnalyzed, recentInteractions, updatedAt }}
 */
export const apiGetUserProfile = () =>
  aiApi.get("/analysis/profile");

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY  /summary/*
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /ai/summary/upload  (multipart/form-data)
 * @param {File}   file
 * @param {string} [bookId]
 * @returns {{ summary, keyPoints, metadata, performance }}
 */
export const apiSummarizeUploadedPdf = (file, bookId) => {
  const formData = new FormData();
  formData.append("file", file);
  if (bookId) formData.append("bookId", bookId);

  return aiApi.post("/summary/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * POST /ai/summary/url
 * @param {string} url
 * @param {string} [bookId]
 * @returns {{ summary, keyPoints, sourceUrl, metadata, performance }}
 */
export const apiSummarizePdfFromUrl = (url, bookId) =>
  aiApi.post("/summary/url", { url, ...(bookId && { bookId }) });

/**
 * POST /ai/summary/text
 * @param {string} text
 * @param {string} [bookId]
 * @returns {{ summary, keyPoints, metadata, performance }}
 */
export const apiSummarizeText = (text, bookId) =>
  aiApi.post("/summary/text", { text, ...(bookId && { bookId }) });

// ─────────────────────────────────────────────────────────────────────────────
// TTS  /tts/*
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /ai/tts/generate
 * Streams WAV audio and returns a disposable blob URL for <audio> playback.
 * Caller is responsible for calling URL.revokeObjectURL() when done.
 *
 * @param {string} text
 * @param {{ speaker?, pitch?, pace?, targetLanguage? }} [options]
 * @returns {Promise<string>} blob URL
 */
export const apiGenerateSpeech = async (text, options = {}) => {
  const token = getToken() || localStorage.getItem("auth-token");

  const response = await axios.post(
    `${BASE}/tts/generate`,
    { text, ...options },
    {
      responseType: "blob",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  return URL.createObjectURL(response.data);
};

/**
 * POST /ai/tts/generate-url
 * @param {string} text
 * @param {{ speaker?, pitch?, pace?, targetLanguage? }} [options]
 * @returns {{ downloadUrl, format, expiresInMinutes, detectedLanguage, languageUsed, speaker, model }}
 */
export const apiGenerateSpeechUrl = (text, options = {}) =>
  aiApi.post("/tts/generate-url", { text, ...options });

/**
 * GET /ai/tts/download/:fileName
 * Downloads a named WAV file and returns a blob URL.
 *
 * @param {string} fileName
 * @returns {Promise<string>} blob URL
 */
export const apiDownloadAudio = async (fileName) => {
  const token = getToken() || localStorage.getItem("auth-token");

  const response = await axios.get(
    `${BASE}/tts/download/${encodeURIComponent(fileName)}`,
    {
      responseType: "blob",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  return URL.createObjectURL(response.data);
};

/**
 * GET /ai/tts/languages
 * @returns {{ languages: Array<{ code, name, availableVoices }>, count, model, provider }}
 */
export const apiGetSupportedLanguages = () =>
  aiApi.get("/tts/languages");

/**
 * POST /ai/tts/extract-pdf-text
 * @param {string} url  Remote PDF URL
 * @returns {{ text, wordCount, pages }}
 */
export const apiExtractPdfText = (url) =>
  aiApi.post("/tts/extract-pdf-text", { url });