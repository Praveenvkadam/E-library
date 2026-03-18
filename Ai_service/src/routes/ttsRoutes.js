/**
 * ttsRoutes.js
 * Routes for multi-language text-to-speech generation.
 */

const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { ttsLimiter } = require("../middleware/rateLimiter");
const {
  generateSpeechHandler,
  generateSpeechUrlHandler,
  downloadAudioHandler,
  getSupportedLanguagesHandler,
  extractPdfTextHandler,           // ← NEW
} = require("../controller/ttsController");

// Public route — no auth needed to list languages
/**
 * @route  GET /ai/tts/languages
 * @desc   Get all supported TTS languages
 * @access Public
 */
router.get("/languages", getSupportedLanguagesHandler);

// Protected routes
router.use(authMiddleware);
router.use(ttsLimiter);

/**
 * @route  POST /ai/tts/generate
 * @desc   Generate and stream WAV audio from text
 * @access Private
 */
router.post("/generate", generateSpeechHandler);

/**
 * @route  POST /ai/tts/generate-url
 * @desc   Generate audio and return a temporary download URL
 * @access Private
 */
router.post("/generate-url", generateSpeechUrlHandler);

/**
 * @route  GET /ai/tts/download/:fileName
 * @desc   Download a generated audio file by name
 * @access Private
 */
router.get("/download/:fileName", downloadAudioHandler);

/**
 * @route  POST /ai/tts/extract-pdf-text          ← NEW
 * @desc   Extract plain text from a remote PDF URL for client-side TTS
 * @access Private
 * @body   { url: string }
 */
router.post("/extract-pdf-text", extractPdfTextHandler);

module.exports = router;