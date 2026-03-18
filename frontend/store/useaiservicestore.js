import { create } from "zustand";
import {
  apiExtractPdfText,
  apiSummarizePdfFromUrl,
  apiSummarizeText,
  apiGenerateSpeech,
  apiGenerateSpeechUrl,
  apiGetSupportedLanguages,
  apiAnalyzeSentiment,
  apiGetRecommendations,
  apiGetUserProfile,
  apiRecordInteraction,
} from "@/lib/aiServiceApi";

const useAIServiceStore = create((set) => ({

  isLoading: false,
  error:     null,

  // ── Extract PDF text for TTS ──────────────────────────────────────────
  // ✅ Uses aiApi axios instance — auth header added automatically
  extractPdfText: async (pdfUrl) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiExtractPdfText(pdfUrl); // ✅ already authenticated
      set({ isLoading: false });
      return data; // { text, wordCount, pages }
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // ── Summarize PDF from URL ────────────────────────────────────────────
  summarizePdf: async (url, bookId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiSummarizePdfFromUrl(url, bookId);
      set({ isLoading: false });
      return data; // { summary, keyPoints, sourceUrl, metadata }
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // ── Generate Speech (blob URL) ────────────────────────────────────────
  generateSpeech: async (text, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      const blobUrl = await apiGenerateSpeech(text, options);
      set({ isLoading: false });
      return blobUrl;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // ── Generate Speech URL ───────────────────────────────────────────────
  generateSpeechUrl: async (text, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiGenerateSpeechUrl(text, options);
      set({ isLoading: false });
      return data; // { downloadUrl, format, ... }
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // ── Supported Languages ───────────────────────────────────────────────
  getSupportedLanguages: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiGetSupportedLanguages();
      set({ isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // ── Sentiment Analysis ────────────────────────────────────────────────
  analyzeSentiment: async (text) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiAnalyzeSentiment(text);
      set({ isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // ── Recommendations ───────────────────────────────────────────────────
  getRecommendations: async (books) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiGetRecommendations(books);
      set({ isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // ── User Profile ──────────────────────────────────────────────────────
  getUserProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiGetUserProfile();
      set({ isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // ── Record Interaction ────────────────────────────────────────────────
  recordInteraction: async (bookData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRecordInteraction(bookData);
      set({ isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },
}));

export default useAIServiceStore;