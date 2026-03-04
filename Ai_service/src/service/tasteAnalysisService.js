/**
 * tasteAnalysisService.js
 * Book taste analysis powered by Sarvam.ai Chat Completion (Sarvam-M).
 * - Sentiment analysis via Sarvam chat
 * - Genre extraction via Sarvam chat
 * - Personalized recommendations via genre scoring
 */

const { sarvamClient, ENDPOINTS } = require("../utils/sarvamClient");
const { callSarvamChat } = require("./summaryService");
const UserPreference = require("../models/userPreference");

/**
 * Analyze sentiment of a book review or description using Sarvam-M.
 * @param {string} text
 * @returns {Promise<{ label: "POSITIVE"|"NEGATIVE"|"NEUTRAL", score: number }>}
 */
const analyzeSentiment = async (text) => {
  try {
    const raw = await callSarvamChat(
      `You are a sentiment analysis engine. 
       Respond ONLY with a valid JSON object: { "label": "POSITIVE"|"NEGATIVE"|"NEUTRAL", "score": 0.0-1.0 }
       No explanation. No markdown. Just the JSON object.`,
      `Analyze the sentiment of this text:\n\n"${text.slice(0, 500)}"`
    );

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      label: ["POSITIVE", "NEGATIVE", "NEUTRAL"].includes(parsed.label)
        ? parsed.label
        : "NEUTRAL",
      score: parseFloat((parsed.score || 0.5).toFixed(4)),
    };
  } catch (err) {
    console.error("[TasteAnalysis] Sentiment failed:", err.message);
    return { label: "NEUTRAL", score: 0.5 };
  }
};

/**
 * Extract genre tags from book description using Sarvam-M.
 * @param {string} description
 * @returns {Promise<string[]>}
 */
const extractGenreTags = async (description) => {
  try {
    const raw = await callSarvamChat(
      `You are a book genre classifier. 
       Respond ONLY with a JSON array of genre strings from this list:
       ["fiction","mystery","romance","sci-fi","fantasy","horror","biography",
        "history","selfhelp","science","thriller","adventure","children","poetry","drama"].
       No explanation. No markdown. Just the JSON array.`,
      `Identify genres for this book:\n\n"${description.slice(0, 600)}"`
    );

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch (err) {
    console.error("[TasteAnalysis] Genre extraction failed:", err.message);
    return [];
  }
};

/**
 * Get or create a user preference document.
 */
const getOrCreatePreference = async (userId) => {
  let pref = await UserPreference.findOne({ userId });
  if (!pref) {
    pref = new UserPreference({ userId });
    await pref.save();
  }
  return pref;
};

/**
 * Record a book interaction and update the user's taste profile.
 * @param {string} userId
 * @param {object} bookData - { bookId, title, description, genres?, rating? }
 * @returns {Promise<object>}
 */
const recordInteraction = async (userId, bookData) => {
  const { bookId, title, description, genres = [], rating } = bookData;

  // Run sentiment + genre extraction in parallel via Sarvam
  const [sentiment, extractedGenres] = await Promise.all([
    analyzeSentiment(description || title || ""),
    genres.length > 0 ? Promise.resolve(genres) : extractGenreTags(description || ""),
  ]);

  const pref = await getOrCreatePreference(userId);

  pref.interactions.push({
    bookId,
    title,
    genres: extractedGenres,
    rating,
    sentiment: sentiment.label,
    sentimentScore: sentiment.score,
  });

  // Update genre scores (weighted moving average)
  for (const genre of extractedGenres) {
    const current = pref.genreScores.get(genre) || 0;
    const weight = rating ? rating / 5 : sentiment.score;
    pref.genreScores.set(genre, parseFloat((current * 0.7 + weight * 0.3).toFixed(4)));
  }

  // Recalculate top genres
  pref.topGenres = [...pref.genreScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre);

  pref.totalBooksAnalyzed += 1;

  const allScores = pref.interactions.map((i) => i.sentimentScore || 0);
  pref.overallSentimentScore = parseFloat(
    (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(4)
  );

  await pref.save();

  return {
    userId,
    topGenres: pref.topGenres,
    totalBooksAnalyzed: pref.totalBooksAnalyzed,
    overallSentimentScore: pref.overallSentimentScore,
    latestInteraction: { sentiment, genres: extractedGenres },
  };
};

/**
 * Generate personalized recommendations using Sarvam-M.
 * @param {string} userId
 * @param {Array<object>} candidateBooks
 * @returns {Promise<object>}
 */
const getRecommendations = async (userId, candidateBooks = []) => {
  const pref = await UserPreference.findOne({ userId });

  if (!pref || pref.totalBooksAnalyzed === 0) {
    return { recommendations: candidateBooks, reason: "No preference data yet." };
  }

  try {
    const bookListStr = candidateBooks
      .map((b, i) => `${i + 1}. "${b.title}" - Genres: ${(b.genres || []).join(", ")}`)
      .join("\n");

    const raw = await callSarvamChat(
      `You are a book recommendation engine. 
       Respond ONLY with a JSON array of book indices (1-based), sorted best to worst match.
       No explanation. Just the JSON array.`,
      `User's top genres: ${pref.topGenres.join(", ")}\n\nBooks to rank:\n${bookListStr}\n\nReturn ranked indices as JSON array.`,
      300
    );

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const indices = JSON.parse(cleaned);

    const ranked = indices
      .filter((i) => i >= 1 && i <= candidateBooks.length)
      .map((i, rank) => ({ ...candidateBooks[i - 1], recommendationScore: 1 - rank * 0.05 }));

    return {
      recommendations: ranked.slice(0, 10),
      basedOn: { topGenres: pref.topGenres, totalBooksAnalyzed: pref.totalBooksAnalyzed },
    };
  } catch {
    // Fallback: return all books unranked
    return { recommendations: candidateBooks.slice(0, 10), reason: "Ranking unavailable." };
  }
};

/**
 * Retrieve full preference profile for a user.
 */
const getUserProfile = async (userId) => {
  const pref = await UserPreference.findOne({ userId }).lean();
  if (!pref) return null;
  return {
    userId: pref.userId,
    topGenres: pref.topGenres,
    genreScores: Object.fromEntries(pref.genreScores || []),
    overallSentimentScore: pref.overallSentimentScore,
    totalBooksAnalyzed: pref.totalBooksAnalyzed,
    recentInteractions: pref.interactions.slice(-5),
    updatedAt: pref.updatedAt,
  };
};

module.exports = {
  analyzeSentiment,
  extractGenreTags,
  recordInteraction,
  getRecommendations,
  getUserProfile,
};