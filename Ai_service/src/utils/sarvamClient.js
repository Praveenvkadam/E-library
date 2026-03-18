
const axios = require("axios");

const SARVAM_BASE_URL = "https://api.sarvam.ai";

const sarvamClient = axios.create({
  baseURL: SARVAM_BASE_URL,
  headers: {
    "api-subscription-key": process.env.SARVAM_API_KEY,
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60s — model inference can be slow
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
sarvamClient.interceptors.request.use(
  (config) => {
    if (!process.env.SARVAM_API_KEY) {
      throw new Error("SARVAM_API_KEY is not set in environment variables.");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
sarvamClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;

    const normalized = new Error(`[Sarvam API] ${status || "Network"}: ${message}`);
    normalized.status = status;
    normalized.originalError = error;

    console.error("[SarvamClient] API error:", normalized.message);
    return Promise.reject(normalized);
  }
);

/**
 * Sarvam API Endpoints reference
 */
const ENDPOINTS = {
  CHAT:             "/v1/chat/completions",
  TRANSLATE:        "/translate",
  TTS:              "/text-to-speech",
  STT:              "/speech-to-text",
  STT_TRANSLATE:    "/speech-to-text-translate",
  TRANSLITERATE:    "/transliterate",
  DETECT_LANGUAGE:  "/text-language-detection",
};
  
module.exports = { sarvamClient, ENDPOINTS };