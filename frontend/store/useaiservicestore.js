import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  
  apiAnalyzeSentiment,
  apiExtractGenres,
  apiRecordInteraction,
  apiGetRecommendations,
  apiGetUserProfile,
  // Summary
  apiSummarizeUploadedPdf,
  apiSummarizePdfFromUrl,
  apiSummarizeText,
  // TTS
  apiGenerateSpeech,
  apiGenerateSpeechUrl,
  apiDownloadAudio,
  apiGetSupportedLanguages,
  apiExtractPdfText,
} from "../lib/aiServiceApi";

// ─── Slice factories ──────────────────────────────────────────────────────────
// Each slice is a plain object merged into the store via set().
// Using a factory keeps each domain's state predictable and DRY.

const asyncSlice = (key) => ({
  [`${key}Data`]:    null,
  [`${key}Loading`]: false,
  [`${key}Error`]:   null,
});

const clearSlice = (set, key) => () =>
  set({ [`${key}Data`]: null, [`${key}Error`]: null, [`${key}Loading`]: false });

const runAsync = async (set, key, apiFn, onSuccess) => {
  set({ [`${key}Loading`]: true, [`${key}Error`]: null });
  try {
    const data = await apiFn();
    set({ [`${key}Data`]: data, [`${key}Loading`]: false });
    onSuccess?.(data);
    return data;
  } catch (err) {
    set({ [`${key}Error`]: err.message, [`${key}Loading`]: false });
    throw err;
  }
};

const useAIServiceStore = create(
  devtools(
    (set, get) => ({
      ...asyncSlice("sentiment"),
      ...asyncSlice("genres"),
      ...asyncSlice("interaction"),
      ...asyncSlice("recommendations"),
      ...asyncSlice("profile"),

      /**
       * Analyze sentiment of a book review / description.
       * @param {string} text
       * @returns {{ text, sentiment, confidenceScore }}
       */
      analyzeSentiment: (text) =>
        runAsync(set, "sentiment", () => apiAnalyzeSentiment(text)),

      /**
       * Extract genre tags from a book description.
       * @param {string} description
       * @returns {{ genres: string[], count: number }}
       */
      extractGenres: (description) =>
        runAsync(set, "genres", () => apiExtractGenres(description)),

      /**
       * Record a book interaction and update the user's taste profile.
       * Silently refreshes `profileData` on success.
       * @param {{ bookId, title, description, genres?, rating? }} bookData
       */
      recordInteraction: (bookData) =>
        runAsync(set, "interaction", () => apiRecordInteraction(bookData), () => {
          get().fetchUserProfile().catch(() => {});
        }),

      /**
       * Get personalised book recommendations.
       * @param {Array<{ bookId, title, description, genres }>} books
       */
      getRecommendations: (books) =>
        runAsync(set, "recommendations", () => apiGetRecommendations(books)),

      /**
       * Fetch the current user's taste profile.
       * Cached in `profileData` — call clearProfile() to force a fresh fetch.
       */
      fetchUserProfile: () =>
        runAsync(set, "profile", () => apiGetUserProfile()),

      clearSentiment:       clearSlice(set, "sentiment"),
      clearGenres:          clearSlice(set, "genres"),
      clearInteraction:     clearSlice(set, "interaction"),
      clearRecommendations: clearSlice(set, "recommendations"),
      clearProfile:         clearSlice(set, "profile"),

      // ════════════════════════════════════════════════════════════════════════
      // SUMMARY
      // ════════════════════════════════════════════════════════════════════════

      ...asyncSlice("summary"),

      /**
       * Summarize an uploaded PDF file.
       * @param {File}    file
       * @param {string}  [bookId]
       * @returns {{ summary, keyPoints, metadata, performance }}
       */
      summarizeUploadedPdf: (file, bookId) =>
        runAsync(set, "summary", () => apiSummarizeUploadedPdf(file, bookId)),

      /**
       * Summarize a PDF from a remote URL.
       * @param {string} url
       * @param {string} [bookId]
       */
      summarizePdfFromUrl: (url, bookId) =>
        runAsync(set, "summary", () => apiSummarizePdfFromUrl(url, bookId)),

      /**
       * Summarize raw text directly.
       * @param {string} text
       * @param {string} [bookId]
       */
      summarizeText: (text, bookId) =>
        runAsync(set, "summary", () => apiSummarizeText(text, bookId)),

      clearSummary: clearSlice(set, "summary"),

      // ════════════════════════════════════════════════════════════════════════
      // TTS
      // ════════════════════════════════════════════════════════════════════════

      ...asyncSlice("speech"),       // blob URL from streamed WAV
      ...asyncSlice("speechUrl"),    // { downloadUrl, format, expiresInMinutes, … }
      ...asyncSlice("namedAudio"),   // blob URL from /download/:fileName
      ...asyncSlice("ttsLanguages"), // [{ code, name, availableVoices }]
      ...asyncSlice("pdfExtract"),   // { text, wordCount, pages }

      ttsLanguagesLoaded: false,     // guard against redundant fetches

      /**
       * Generate speech and expose a blob URL for <audio> playback.
       * Auto-revokes the previous blob URL to prevent memory leaks.
       *
       * @param {string} text
       * @param {{ speaker?, pitch?, pace?, targetLanguage? }} [options]
       * @returns {Promise<string>} blob URL
       */
      generateSpeech: async (text, options = {}) => {
        const prev = get().speechData;
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return runAsync(set, "speech", () => apiGenerateSpeech(text, options));
      },

      /**
       * Generate speech and return a temporary server-side download URL.
       * @param {string} text
       * @param {{ speaker?, pitch?, pace?, targetLanguage? }} [options]
       */
      generateSpeechUrl: (text, options = {}) =>
        runAsync(set, "speechUrl", () => apiGenerateSpeechUrl(text, options)),

      /**
       * Download a named WAV file from the server as a blob URL.
       * Auto-revokes the previous blob URL.
       * @param {string} fileName
       */
      downloadAudio: async (fileName) => {
        const prev = get().namedAudioData;
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return runAsync(set, "namedAudio", () => apiDownloadAudio(fileName));
      },

      /**
       * Fetch supported TTS languages and voices.
       * Short-circuits if already loaded — call clearTtsLanguages() to refetch.
       */
      fetchSupportedLanguages: async () => {
        if (get().ttsLanguagesLoaded) return get().ttsLanguagesData;
        const data = await runAsync(set, "ttsLanguages", () => apiGetSupportedLanguages());
        set({ ttsLanguagesLoaded: true });
        return data;
      },

      /**
       * Extract plain text from a remote PDF URL (for feeding into TTS).
       * @param {string} url
       * @returns {{ text, wordCount, pages }}
       */
      extractPdfText: (url) =>
        runAsync(set, "pdfExtract", () => apiExtractPdfText(url)),

      clearSpeech: () => {
        const url = get().speechData;
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        clearSlice(set, "speech")();
      },

      clearNamedAudio: () => {
        const url = get().namedAudioData;
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        clearSlice(set, "namedAudio")();
      },

      clearSpeechUrl:     clearSlice(set, "speechUrl"),
      clearPdfExtract:    clearSlice(set, "pdfExtract"),
      clearTtsLanguages:  () => {
        clearSlice(set, "ttsLanguages")();
        set({ ttsLanguagesLoaded: false });
      },

      // ════════════════════════════════════════════════════════════════════════
      // GLOBAL RESET
      // ════════════════════════════════════════════════════════════════════════

      /**
       * Wipe all store state. Revokes any live blob URLs first.
       */
      resetAll: () => {
        [get().speechData, get().namedAudioData].forEach((u) => {
          if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
        });

        set({
          // Analysis
          sentimentData: null,       sentimentLoading: false,       sentimentError: null,
          genresData: null,          genresLoading: false,          genresError: null,
          interactionData: null,     interactionLoading: false,     interactionError: null,
          recommendationsData: null, recommendationsLoading: false, recommendationsError: null,
          profileData: null,         profileLoading: false,         profileError: null,
          // Summary
          summaryData: null,         summaryLoading: false,         summaryError: null,
          // TTS
          speechData: null,          speechLoading: false,          speechError: null,
          speechUrlData: null,       speechUrlLoading: false,       speechUrlError: null,
          namedAudioData: null,      namedAudioLoading: false,      namedAudioError: null,
          ttsLanguagesData: null,    ttsLanguagesLoading: false,    ttsLanguagesError: null,
          ttsLanguagesLoaded: false,
          pdfExtractData: null,      pdfExtractLoading: false,      pdfExtractError: null,
        });
      },
    }),
    { name: "AIServiceStore" }
  )
);

export default useAIServiceStore;