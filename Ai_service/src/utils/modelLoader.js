/**
 * modelLoader.js
 * With Sarvam.ai, all AI inference happens via REST API — no local models needed.
 * This file now serves as a connection health checker for the Sarvam API.
 */

const { sarvamClient } = require("./sarvamClient");

/**
 * Verify Sarvam API connectivity at startup.
 * Logs success or failure — does NOT block server start.
 */
const preloadModels = async () => {
  try {
    console.log("[SarvamClient] Verifying API key and connectivity...");
    // Lightweight call to confirm the key works
    await sarvamClient.post("/text-language-detection", { input: "hello" });
    console.log("[SarvamClient]  Sarvam.ai API connected successfully.");
    console.log("[SarvamClient] Active models: Sarvam-M (chat), Bulbul v3 (TTS), Saaras v3 (STT)");
  } catch (err) {
    console.error("[SarvamClient]  API verification failed:", err.message);
    console.error("[SarvamClient] Check SARVAM_API_KEY in your .env file.");
  }
};

module.exports = { preloadModels };