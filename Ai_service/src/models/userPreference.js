/**
 * userPreference.js
 * Stores per-user reading preferences and genre embeddings
 * used by the taste analysis engine.
 */

const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
  {
    bookId: { type: String, required: true },
    title: { type: String },
    genres: [{ type: String }],
    rating: { type: Number, min: 1, max: 5 },
    sentiment: { type: String, enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"] },
    sentimentScore: { type: Number },
    readDurationMinutes: { type: Number },
    completedReading: { type: Boolean, default: false },
  },
  { _id: false, timestamps: true }
);

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Genre affinity scores (0.0 – 1.0)
    genreScores: {
      type: Map,
      of: Number,
      default: {},
    },

    // Average sentiment across all reviewed books
    overallSentimentScore: {
      type: Number,
      default: 0,
    },

    // Top genres derived from interaction history
    topGenres: [{ type: String }],

    // Raw interaction history (last 100 entries)
    interactions: {
      type: [interactionSchema],
      default: [],
    },

    // Embedding vector of user taste (for similarity search)
    tasteEmbedding: {
      type: [Number],
      default: [],
    },

    totalBooksAnalyzed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "user_preferences",
  }
);

// Keep only the last 100 interactions
userPreferenceSchema.pre("save", function (next) {
  if (this.interactions.length > 100) {
    this.interactions = this.interactions.slice(-100);
  }
  next();
});

module.exports = mongoose.models.UserPreference || mongoose.model("UserPreference", userPreferenceSchema);