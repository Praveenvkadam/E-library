/**
 * ttsService.js
 * Multi-language Text-to-Speech using Sarvam.ai Bulbul v3.
 * Supports 10 Indian languages + English with 30+ speaker voices.
 * API: POST https://api.sarvam.ai/text-to-speech
 */

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { sarvamClient, ENDPOINTS } = require("../utils/sarvamClient");
const { detectLanguage } = require("../utils/languageDetect");
const { chunkText } = require("../utils/chunkText");

const OUTPUT_DIR = path.join(__dirname, "../../uploads/audio");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Available Sarvam Bulbul v3 speaker voices.
 * See: https://dashboard.sarvam.ai to preview voices.
 */
const SARVAM_VOICES = {
  "en-IN": ["meera", "pavithra", "maitreyi", "arvind", "amol", "amartya"],
  "hi-IN": ["meera", "pavithra", "maitreyi", "arvind", "amol", "amartya"],
  "bn-IN": ["meera", "pavithra", "maitreyi", "arvind", "amol", "amartya"],
  "ta-IN": ["meera", "pavithra", "maitreyi", "arvind", "amol", "amartya"],
  "te-IN": ["meera", "pavithra", "maitreyi", "arvind", "amol", "amartya"],
  "kn-IN": ["meera", "pavithra", "maitreyi", "arvind", "amol", "amartya"],
  "ml-IN": ["meera", "pavithra", "maitreyi", "arvind", "amol", "amartya"],
  "mr-IN": ["meera", "pavithra", "maitreyi", "arvind", "amol", "amartya"],
  "gu-IN": ["meera", "pavithra", "maitreyi", "arvind", "amol", "amartya"],
  "pa-IN": ["meera", "pavithra", "maitreyi", "arvind", "amol", "amartya"],
  "od-IN": ["meera", "pavithra", "maitreyi", "arvind", "amol", "amartya"],
};

const DEFAULT_VOICE = "meera";

/**
 * Convert a single text chunk to speech via Sarvam API.
 * Returns base64-encoded audio string.
 * @param {string} text
 * @param {string} languageCode - BCP-47 e.g. "hi-IN"
 * @param {string} speakerName  - Sarvam speaker voice name
 * @param {number} pitch        - -10 to 10 (default 0)
 * @param {number} pace         - 0.5 to 2.0 (default 1.0)
 * @returns {Promise<string>} base64 audio
 */
const convertChunkToSpeech = async (text, languageCode, speakerName, pitch = 0, pace = 1.0) => {
  const response = await sarvamClient.post(ENDPOINTS.TTS, {
    inputs: [text],
    target_language_code: languageCode,
    speaker: speakerName,
    pitch,
    pace,
    loudness: 1.5,
    speech_sample_rate: 22050,
    enable_preprocessing: true,
    model: "bulbul:v1",
  });

  const audios = response.data?.audios;
  if (!audios || audios.length === 0) {
    throw new Error("Sarvam TTS returned no audio data.");
  }

  return audios[0]; // base64 WAV string
};

/**
 * Translate text to target language before TTS (optional).
 * @param {string} text
 * @param {string} sourceCode
 * @param {string} targetCode
 * @returns {Promise<string>} translated text
 */
const translateForTts = async (text, sourceCode, targetCode) => {
  if (sourceCode === targetCode) return text;
  const response = await sarvamClient.post(ENDPOINTS.TRANSLATE, {
    input: text,
    source_language_code: sourceCode,
    target_language_code: targetCode,
    speaker_gender: "Female",
    mode: "formal",
    model: "mayura:v1",
    enable_preprocessing: false,
  });
  return response.data?.translated_text || text;
};

/**
 * Main TTS entry point.
 * Auto-detects language, splits long text into chunks, merges audio.
 *
 * @param {string} text
 * @param {object} options - { speaker?, pitch?, pace?, targetLanguage? }
 * @returns {Promise<{ filePath, fileName, format, detectedLanguage }>}
 */
const generateSpeech = async (text, options = {}) => {
  const { speaker = DEFAULT_VOICE, pitch = 0, pace = 1.0, targetLanguage } = options;

  // Detect source language
  const detectedLanguage = await detectLanguage(text);
  const languageCode = targetLanguage || detectedLanguage.ttsCode;

  // Validate speaker for target language
  const availableVoices = SARVAM_VOICES[languageCode] || SARVAM_VOICES["en-IN"];
  const resolvedSpeaker = availableVoices.includes(speaker) ? speaker : DEFAULT_VOICE;

  // Split text (Sarvam TTS has ~500 char limit per input)
  const chunks = chunkText(text, 450, 0);
  console.log(`[TtsService] Processing ${chunks.length} chunk(s) via Sarvam Bulbul v3`);

  const audioBase64Parts = [];

  for (const chunk of chunks) {
    const base64Audio = await convertChunkToSpeech(
      chunk,
      languageCode,
      resolvedSpeaker,
      pitch,
      pace
    );
    audioBase64Parts.push(base64Audio);
  }

  // Decode and merge all WAV buffers
  const audioBuffers = audioBase64Parts.map((b64) => Buffer.from(b64, "base64"));
  const mergedAudio = mergeWavBuffers(audioBuffers);

  const fileName = `tts-${uuidv4()}.wav`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  fs.writeFileSync(filePath, mergedAudio);

  // Auto-cleanup after 10 minutes
  setTimeout(() => {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }, 10 * 60 * 1000);

  return {
    filePath,
    fileName,
    format: "wav",
    detectedLanguage,
    languageUsed: languageCode,
    speaker: resolvedSpeaker,
  };
};

/**
 * Merge multiple WAV buffers by splicing PCM data sections together.
 * @param {Buffer[]} buffers
 * @returns {Buffer}
 */
const mergeWavBuffers = (buffers) => {
  if (buffers.length === 1) return buffers[0];

  const pcmChunks = buffers.map((b) => b.slice(44));
  const sampleRate = buffers[0].readUInt32LE(24);
  const totalPcm = Buffer.concat(pcmChunks);
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + totalPcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(totalPcm.length, 40);

  return Buffer.concat([header, totalPcm]);
};

module.exports = { generateSpeech, translateForTts, SARVAM_VOICES };