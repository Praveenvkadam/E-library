/**
 * summaryService.js
 * AI-powered PDF summarization using Sarvam.ai Chat Completion (Sarvam-M).
 * Supports Indian language summaries via built-in multilingual model.
 * API: POST https://api.sarvam.ai/chat/completions
 */

const { sarvamClient, ENDPOINTS } = require("../utils/sarvamClient");
const { chunkText } = require("../utils/chunkText");
const SummaryCache = require("../models/summaryCache");

const SARVAM_CHAT_MODEL = "sarvam-m";

/**
 * Call Sarvam Chat Completion.
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {number} maxTokens
 * @returns {Promise<string>}
 */
const callSarvamChat = async (systemPrompt, userMessage, maxTokens = 1024) => {
  const response = await sarvamClient.post(ENDPOINTS.CHAT, {
    model: SARVAM_CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMessage },
    ],
    max_tokens: maxTokens,
    temperature: 0.3,
  });

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Sarvam chat returned empty response.");
  return content.trim();
};

/**
 * Summarize a single text chunk.
 * @param {string} chunk
 * @param {string} language - e.g. "Hindi", "English"
 * @returns {Promise<string>}
 */
const summarizeChunk = async (chunk, language = "English") => {
  return callSarvamChat(
    `You are a literary assistant. Summarize book passages clearly and concisely in ${language}.`,
    `Summarize this passage in 3-5 sentences:\n\n${chunk}`,
    300
  );
};

/**
 * Extract 5 key points from text as a JSON array.
 * @param {string} text
 * @param {string} language
 * @returns {Promise<string[]>}
 */
const extractKeyPoints = async (text, language = "English") => {
  try {
    const raw = await callSarvamChat(
      `You are a book analyst. Respond ONLY with a valid JSON array of strings. No explanation.`,
      `Extract exactly 5 key points from this text in ${language}. Return ONLY a JSON array:\n\n${text.slice(0, 2000)}`,
      400
    );

    // Strip markdown fences if present
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return []; // Key points are optional; don't fail summarization
  }
};

/**
 * Translate summary to target language using Sarvam translate API.
 * @param {string} text
 * @param {string} targetLangCode - BCP-47 e.g. "hi-IN"
 * @returns {Promise<string>}
 */
const translateSummary = async (text, targetLangCode) => {
  if (!targetLangCode || targetLangCode === "en-IN") return text;

  try {
    const response = await sarvamClient.post(ENDPOINTS.TRANSLATE, {
      input: text,
      source_language_code: "en-IN",
      target_language_code: targetLangCode,
      speaker_gender: "Female",
      mode: "formal",
      model: "mayura:v1",
      enable_preprocessing: false,
    });
    return response.data?.translated_text || text;
  } catch (err) {
    console.warn("[SummaryService] Translation failed, returning English summary:", err.message);
    return text;
  }
};

/**
 * Main summarization entry point with cache lookup.
 * @param {string} text           - Extracted PDF text
 * @param {string} bookId         - Optional book ID
 * @param {string} languageCode   - BCP-47 detected language code e.g. "hi-IN"
 * @param {string} languageName   - Human-readable name e.g. "Hindi"
 * @returns {Promise<object>}
 */
const summarizePdf = async (text, bookId = null, languageCode = "en-IN", languageName = "English") => {
  const startTime = Date.now();
  const contentHash = SummaryCache.hashContent(text);

  // ── Cache lookup ────────────────────────────────────────────────────────────
  const cached = await SummaryCache.findOne({ contentHash });
  if (cached) {
    console.log(`[SummaryService] Cache hit: ${contentHash.slice(0, 8)}`);
    return {
      summary: cached.summary,
      keyPoints: cached.keyPoints,
      fromCache: true,
      processingTimeMs: 0,
      model: cached.model,
    };
  }

  // ── Chunk & summarize ───────────────────────────────────────────────────────
  const chunks = chunkText(text, 2500, 150);
  console.log(`[SummaryService] Summarizing ${chunks.length} chunk(s) via Sarvam-M`);

  let chunkSummaries;

  if (chunks.length === 1) {
    chunkSummaries = [await summarizeChunk(chunks[0], "English")];
  } else {
    chunkSummaries = await Promise.all(
      chunks.map((chunk) => summarizeChunk(chunk, "English"))
    );
  }

  // ── Final synthesis ─────────────────────────────────────────────────────────
  let finalSummary;
  const combined = chunkSummaries.join("\n\n");

  if (chunkSummaries.length === 1) {
    finalSummary = chunkSummaries[0];
  } else {
    finalSummary = await callSarvamChat(
      "You are a literary assistant. Synthesize chapter summaries into one coherent book summary.",
      `Combine these summaries into a single, well-written paragraph (max 200 words):\n\n${combined}`,
      500
    );
  }

  // ── Translate if non-English ────────────────────────────────────────────────
  if (languageCode !== "en-IN") {
    console.log(`[SummaryService] Translating summary to ${languageName}`);
    finalSummary = await translateSummary(finalSummary, languageCode);
  }

  // ── Extract key points (always in detected language) ────────────────────────
  const keyPoints = await extractKeyPoints(text, languageName);

  const processingTimeMs = Date.now() - startTime;

  // ── Cache result ────────────────────────────────────────────────────────────
  await SummaryCache.create({
    contentHash,
    bookId,
    originalTextLength: text.length,
    summary: finalSummary,
    keyPoints,
    detectedLanguage: languageCode,
    model: SARVAM_CHAT_MODEL,
    processingTimeMs,
  });

  return {
    summary: finalSummary,
    keyPoints,
    fromCache: false,
    processingTimeMs,
    model: SARVAM_CHAT_MODEL,
  };
};

module.exports = { summarizePdf, callSarvamChat };