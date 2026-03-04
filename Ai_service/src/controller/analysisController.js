/**
 * analysisController.js
 * Handles HTTP requests for book taste analysis and recommendations.
 */

const {
  analyzeSentiment,
  extractGenreTags,
  recordInteraction,
  getRecommendations,
  getUserProfile,
} = require("../service/tasteAnalysisService");

/**
 * POST /ai/analysis/sentiment
 * Analyze sentiment of a text (book review, description, etc.)
 * Body: { text: string }
 */
const analyzeSentimentHandler = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 5) {
      return res.status(400).json({ success: false, message: "Text is required." });
    }

    const result = await analyzeSentiment(text);

    return res.status(200).json({
      success: true,
      data: {
        text: text.slice(0, 100) + (text.length > 100 ? "..." : ""),
        sentiment: result.label,
        confidenceScore: result.score,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /ai/analysis/genres
 * Extract genre tags from book description.
 * Body: { description: string }
 */
const extractGenresHandler = async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ success: false, message: "Description is required." });
    }

    const genres = extractGenreTags(description);

    return res.status(200).json({
      success: true,
      data: { genres, count: genres.length },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /ai/analysis/interaction
 * Record a book interaction and update user taste profile.
 * Body: { bookId, title, description, genres?, rating? }
 */
const recordInteractionHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { bookId, title, description, genres, rating } = req.body;

    if (!bookId) {
      return res.status(400).json({ success: false, message: "bookId is required." });
    }

    const result = await recordInteraction(userId, {
      bookId,
      title,
      description,
      genres,
      rating,
    });

    return res.status(200).json({
      success: true,
      message: "Interaction recorded and preference profile updated.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /ai/analysis/recommend
 * Get personalized book recommendations.
 * Body: { books: Array<{ bookId, title, description, genres }> }
 */
const getRecommendationsHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { books = [] } = req.body;

    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ success: false, message: "Books array is required." });
    }

    const result = await getRecommendations(userId, books);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /ai/analysis/profile
 * Retrieve current user's taste profile.
 */
const getUserProfileHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const profile = await getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "No profile found. Start reading to build your taste profile!",
      });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  analyzeSentimentHandler,
  extractGenresHandler,
  recordInteractionHandler,
  getRecommendationsHandler,
  getUserProfileHandler,
};