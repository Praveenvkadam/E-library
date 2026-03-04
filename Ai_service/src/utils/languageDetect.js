/**
 * languageDetect.js
 * Detects language using Sarvam.ai's /text-language-detection endpoint.
 * Supports 22 Indian languages + English.
 */

const { sarvamClient, ENDPOINTS } = require("./sarvamClient");

const SARVAM_LANGUAGE_MAP = {
  "en-IN": { name: "English",   ttsCode: "en-IN", translateCode: "en-IN" },
  "hi-IN": { name: "Hindi",     ttsCode: "hi-IN", translateCode: "hi-IN" },
  "bn-IN": { name: "Bengali",   ttsCode: "bn-IN", translateCode: "bn-IN" },
  "ta-IN": { name: "Tamil",     ttsCode: "ta-IN", translateCode: "ta-IN" },
  "te-IN": { name: "Telugu",    ttsCode: "te-IN", translateCode: "te-IN" },
  "kn-IN": { name: "Kannada",   ttsCode: "kn-IN", translateCode: "kn-IN" },
  "ml-IN": { name: "Malayalam", ttsCode: "ml-IN", translateCode: "ml-IN" },
  "mr-IN": { name: "Marathi",   ttsCode: "mr-IN", translateCode: "mr-IN" },
  "gu-IN": { name: "Gujarati",  ttsCode: "gu-IN", translateCode: "gu-IN" },
  "pa-IN": { name: "Punjabi",   ttsCode: "pa-IN", translateCode: "pa-IN" },
  "od-IN": { name: "Odia",      ttsCode: "od-IN", translateCode: "od-IN" },
  "ur-IN": { name: "Urdu",      ttsCode: "ur-IN", translateCode: "ur-IN" },
  "as-IN": { name: "Assamese",  ttsCode: "as-IN", translateCode: "as-IN" },
};

const DEFAULT = { code: "en-IN", ...SARVAM_LANGUAGE_MAP["en-IN"] };

/**
 * Detect language using Sarvam.ai API.
 * @param {string} text
 * @returns {Promise<{ code, name, ttsCode, translateCode }>}
 */
const detectLanguage = async (text) => {
  if (!text || text.trim().length < 10) return DEFAULT;
  try {
    const response = await sarvamClient.post(ENDPOINTS.DETECT_LANGUAGE, {
      input: text.slice(0, 500),
    });
    const code = response.data?.language_code;
    if (!code || !SARVAM_LANGUAGE_MAP[code]) return DEFAULT;
    return { code, ...SARVAM_LANGUAGE_MAP[code] };
  } catch (err) {
    console.error("[LanguageDetect] Failed:", err.message);
    return DEFAULT;
  }
};

/**
 * Return list of all supported languages.
 */
const getSupportedLanguages = () =>
  Object.entries(SARVAM_LANGUAGE_MAP).map(([code, data]) => ({ code, ...data }));

module.exports = { detectLanguage, getSupportedLanguages };