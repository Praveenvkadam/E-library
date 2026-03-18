

const BASE = `${process.env.NEXT_PUBLIC_AI_SERVICE_API_URL}/ai`;

// ─── Auth / Header helpers ────────────────────────────────────────────────────

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const jsonHeaders = () => ({
  "Content-Type": "application/json",
  ...authHeader(),
});

/**
 * Shared JSON fetch — throws on !ok or !json.success.
 */
const apiFetch = async (url, options = {}) => {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok || !json.success)
    throw new Error(json.message || `Request failed (${res.status})`);
  return json.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// ANALYSIS  /ai/analysis/*
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /ai/analysis/sentiment
 * @param {string} text
 * @returns {{ text: string, sentiment: string, confidenceScore: number }}
 */
export const apiAnalyzeSentiment = (text) =>
  apiFetch(`${BASE}/analysis/sentiment`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ text }),
  });

/**
 * POST /ai/analysis/genres
 * @param {string} description
 * @returns {{ genres: string[], count: number }}
 */
export const apiExtractGenres = (description) =>
  apiFetch(`${BASE}/analysis/genres`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ description }),
  });

/**
 * POST /ai/analysis/interaction
 * @param {{ bookId: string, title: string, description: string, genres?: string[], rating?: number }} bookData
 * @returns {{ userId, topGenres, totalBooksAnalyzed, overallSentimentScore, latestInteraction }}
 */
export const apiRecordInteraction = (bookData) =>
  apiFetch(`${BASE}/analysis/interaction`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(bookData),
  });

/**
 * POST /ai/analysis/recommend
 * @param {Array<{ bookId, title, description, genres }>} books
 * @returns {{ recommendations: object[], basedOn?: object }}
 */
export const apiGetRecommendations = (books) =>
  apiFetch(`${BASE}/analysis/recommend`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ books }),
  });

/**
 * GET /ai/analysis/profile
 * @returns {{ userId, topGenres, genreScores, overallSentimentScore, totalBooksAnalyzed, recentInteractions, updatedAt }}
 */
export const apiGetUserProfile = () =>
  apiFetch(`${BASE}/analysis/profile`, {
    headers: authHeader(),
  });

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY  /ai/summary/*
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /ai/summary/upload  (multipart/form-data)
 * @param {File}    file
 * @param {string}  [bookId]
 * @returns {{ summary, keyPoints, metadata, performance }}
 */
export const apiSummarizeUploadedPdf = (file, bookId) => {
  const formData = new FormData();
  formData.append("file", file);
  if (bookId) formData.append("bookId", bookId);

  return apiFetch(`${BASE}/summary/upload`, {
    method: "POST",
    headers: authHeader(),        // browser sets multipart boundary automatically
    body: formData,
  });
};

/**
 * POST /ai/summary/url
 * @param {string} url
 * @param {string} [bookId]
 * @returns {{ summary, keyPoints, sourceUrl, metadata, performance }}
 */
export const apiSummarizePdfFromUrl = (url, bookId) =>
  apiFetch(`${BASE}/summary/url`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ url, ...(bookId && { bookId }) }),
  });

/**
 * POST /ai/summary/text
 * @param {string} text
 * @param {string} [bookId]
 * @returns {{ summary, keyPoints, metadata, performance }}
 */
export const apiSummarizeText = (text, bookId) =>
  apiFetch(`${BASE}/summary/text`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ text, ...(bookId && { bookId }) }),
  });

// ─────────────────────────────────────────────────────────────────────────────
// TTS  /ai/tts/*
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
  const res = await fetch(`${BASE}/tts/generate`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ text, ...options }),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || `TTS request failed (${res.status})`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

/**
 * POST /ai/tts/generate-url
 * @param {string} text
 * @param {{ speaker?, pitch?, pace?, targetLanguage? }} [options]
 * @returns {{ downloadUrl, format, expiresInMinutes, detectedLanguage, languageUsed, speaker, model }}
 */
export const apiGenerateSpeechUrl = (text, options = {}) =>
  apiFetch(`${BASE}/tts/generate-url`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ text, ...options }),
  });

/**
 * GET /ai/tts/download/:fileName
 * Downloads a named WAV file and returns a blob URL.
 *
 * @param {string} fileName
 * @returns {Promise<string>} blob URL
 */
export const apiDownloadAudio = async (fileName) => {
  const res = await fetch(`${BASE}/tts/download/${encodeURIComponent(fileName)}`, {
    headers: authHeader(),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || `Download failed (${res.status})`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

/**
 * GET /ai/tts/languages
 * @returns {{ languages: Array<{ code, name, availableVoices }>, count, model, provider }}
 */
export const apiGetSupportedLanguages = () =>
  apiFetch(`${BASE}/tts/languages`, {
    headers: authHeader(),
  });

/**
 * POST /ai/tts/extract-pdf-text
 * @param {string} url - Remote PDF URL
 * @returns {{ text: string, wordCount: number, pages: number }}
 */
export const apiExtractPdfText = (url) =>
  apiFetch(`${BASE}/tts/extract-pdf-text`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ url }),
  });