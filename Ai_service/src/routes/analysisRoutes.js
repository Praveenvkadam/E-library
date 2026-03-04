/**
 * analysisRoutes.js
 * Routes for book taste analysis and recommendation engine.
 */

const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { analysisLimiter } = require("../middleware/rateLimiter");
const {
  analyzeSentimentHandler,
  extractGenresHandler,
  recordInteractionHandler,
  getRecommendationsHandler,
  getUserProfileHandler,
} = require("../controller/analysisController");

// All routes require authentication
router.use(authMiddleware);
router.use(analysisLimiter);

/**
 * @route  POST /ai/analysis/sentiment
 * @desc   Analyze sentiment of a text
 * @access Private
 */
router.post("/sentiment", analyzeSentimentHandler);

/**
 * @route  POST /ai/analysis/genres
 * @desc   Extract genre tags from book description
 * @access Private
 */
router.post("/genres", extractGenresHandler);

/**
 * @route  POST /ai/analysis/interaction
 * @desc   Record a book interaction (view/rate/read) and update taste profile
 * @access Private
 */
router.post("/interaction", recordInteractionHandler);

/**
 * @route  POST /ai/analysis/recommend
 * @desc   Get personalized book recommendations from a candidate pool
 * @access Private
 */
router.post("/recommend", getRecommendationsHandler);

/**
 * @route  GET /ai/analysis/profile
 * @desc   Get current user's taste profile
 * @access Private
 */
router.get("/profile", getUserProfileHandler);

module.exports = router;