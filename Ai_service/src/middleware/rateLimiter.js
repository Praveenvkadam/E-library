/**
 * rateLimiter.js
 * Protects heavy AI endpoints from abuse.
 * Different limits per feature (summarization is heaviest).
 */

const rateLimit = require("express-rate-limit");

const createLimiter = (windowMinutes, maxRequests, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    // FIX ERR_ERL_KEY_GEN_IPV6:
    // Only return a custom key for authenticated users.
    // For unauthenticated requests, return undefined so express-rate-limit
    // handles IP resolution internally (IPv4 + IPv6 safe).
    keyGenerator: (req) => {
      if (req.user?.userId) return `user_${req.user.userId}`;
      return undefined; // falls back to built-in IP handling
    },
  });

// General API limiter — 200 requests per 15 minutes
const generalLimiter = createLimiter(
  15,
  200,
  "Too many requests. Please try again in 15 minutes."
);

// Summarization limiter — expensive model inference
const summaryLimiter = createLimiter(
  60,
  20,
  "PDF summarization limit reached (20/hour). Upgrade your plan for more."
);

// TTS limiter — audio generation is resource-intensive
const ttsLimiter = createLimiter(
  60,
  50,
  "Text-to-speech limit reached (50/hour). Please try again later."
);

// Taste analysis limiter
const analysisLimiter = createLimiter(
  15,
  30,
  "Analysis limit reached. Please try again in 15 minutes."
);

module.exports = { generalLimiter, summaryLimiter, ttsLimiter, analysisLimiter };