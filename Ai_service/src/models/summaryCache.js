/**
 * summaryCache.js
 * Caches AI-generated summaries to avoid re-processing the same PDF.
 * Key: SHA-256 hash of the PDF content.
 */

const mongoose = require("mongoose");
const crypto = require("crypto");

const summaryCacheSchema = new mongoose.Schema(
  {
    // SHA-256 hash of the original PDF text content
    contentHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    bookId: {
      type: String,
      index: true,
    },

    originalTextLength: {
      type: Number,
    },

    summary: {
      type: String,
      required: true,
    },

    keyPoints: [{ type: String }],

    detectedLanguage: {
      type: String,
      default: "eng",
    },

    model: {
      type: String,
      default: "Xenova/bart-large-cnn",
    },

    processingTimeMs: {
      type: Number,
    },

    // Auto-expire cached summaries after 30 days
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
    collection: "summary_cache",
  }
);

/**
 * Generate SHA-256 hash for cache key.
 * @param {string} text
 * @returns {string}
 */
summaryCacheSchema.statics.hashContent = (text) => {
  return crypto.createHash("sha256").update(text).digest("hex");
};

module.exports = mongoose.models.SummaryCache || mongoose.model("SummaryCache", summaryCacheSchema);