/**
 * ttsController.js
 * Handles HTTP requests for Sarvam.ai Bulbul v3 TTS.
 */

const fs = require("fs");
const path = require("path");
const { generateSpeech, SARVAM_VOICES } = require("../service/ttsService");
const { getSupportedLanguages } = require("../utils/languageDetect");

/**
 * POST /ai/tts/generate
 * Generate and stream WAV audio using Sarvam Bulbul v3.
 * Body: { text, speaker?, pitch?, pace?, targetLanguage? }
 */
const generateSpeechHandler = async (req, res, next) => {
  try {
    const { text, speaker, pitch, pace, targetLanguage } = req.body;

    if (!text || text.trim().length === 0)
      return res.status(400).json({ success: false, message: "Text is required." });

    if (text.length > 5000)
      return res.status(400).json({ success: false, message: "Max 5,000 characters per request." });

    const result = await generateSpeech(text, { speaker, pitch, pace, targetLanguage });

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    res.setHeader("X-Detected-Language", result.detectedLanguage.name);
    res.setHeader("X-Language-Used", result.languageUsed);
    res.setHeader("X-Speaker", result.speaker);

    fs.createReadStream(result.filePath).pipe(res);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /ai/tts/generate-url
 * Generate audio and return a temporary download URL.
 * Body: { text, speaker?, pitch?, pace?, targetLanguage? }
 */
const generateSpeechUrlHandler = async (req, res, next) => {
  try {
    const { text, speaker, pitch, pace, targetLanguage } = req.body;

    if (!text || text.trim().length === 0)
      return res.status(400).json({ success: false, message: "Text is required." });

    const result = await generateSpeech(text, { speaker, pitch, pace, targetLanguage });
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return res.status(200).json({
      success: true,
      data: {
        downloadUrl: `${baseUrl}/ai/tts/download/${result.fileName}`,
        format: "wav",
        expiresInMinutes: 10,
        detectedLanguage: result.detectedLanguage,
        languageUsed: result.languageUsed,
        speaker: result.speaker,
        model: "bulbul:v1",
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /ai/tts/download/:fileName
 * Download a previously generated audio file.
 */
const downloadAudioHandler = async (req, res, next) => {
  try {
    const { fileName } = req.params;
    if (fileName.includes("..") || fileName.includes("/"))
      return res.status(400).json({ success: false, message: "Invalid file name." });

    const filePath = path.join(__dirname, "../../uploads/audio", fileName);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ success: false, message: "Audio file not found or expired." });

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /ai/tts/languages
 * List all Sarvam-supported TTS languages and available voices.
 */
const getSupportedLanguagesHandler = (req, res) => {
  const languages = getSupportedLanguages();
  return res.status(200).json({
    success: true,
    data: {
      languages: languages.map((l) => ({
        ...l,
        availableVoices: SARVAM_VOICES[l.code] || [],
      })),
      count: languages.length,
      model: "bulbul:v1",
      provider: "Sarvam.ai",
    },
  });
};

module.exports = {
  generateSpeechHandler,
  generateSpeechUrlHandler,
  downloadAudioHandler,
  getSupportedLanguagesHandler,
};