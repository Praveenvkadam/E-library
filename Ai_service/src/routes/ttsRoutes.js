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
 * @desc   Generate and stream audio from text
 * @access Private
 * @body   { text, voice?, engine?: "kokoro"|"google", gender? }
 */
router.post("/generate", generateSpeechHandler);

/**
 * @route  POST /ai/tts/generate-url
 * @desc   Generate audio and return a temporary download URL
 * @access Private
 * @body   { text, voice?, engine?, gender? }
 */
router.post("/generate-url", generateSpeechUrlHandler);

/**
 * @route  GET /ai/tts/download/:fileName
 * @desc   Download a generated audio file by name
 * @access Private
 */
router.get("/download/:fileName", downloadAudioHandler);

module.exports = router;