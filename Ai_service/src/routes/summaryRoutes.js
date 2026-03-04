/**
 * summaryRoutes.js
 * Routes for AI-powered PDF summarization.
 */

const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { summaryLimiter } = require("../middleware/rateLimiter");
const { upload, cleanupAfterResponse } = require("../middleware/fileUpload");
const {
  summarizeUploadedPdfHandler,
  summarizePdfFromUrlHandler,
  summarizeTextHandler,
} = require("../controller/summaryController");

// All routes require authentication
router.use(authMiddleware);
router.use(summaryLimiter);

/**
 * @route  POST /ai/summary/upload
 * @desc   Upload a PDF file and get an AI summary
 * @access Private
 * @form   file: PDF binary, bookId?: string
 */
router.post(
  "/upload",
  upload.single("file"),
  cleanupAfterResponse,
  summarizeUploadedPdfHandler
);

/**
 * @route  POST /ai/summary/url
 * @desc   Summarize a PDF from a remote URL (e.g. BookUpload service S3 link)
 * @access Private
 * @body   { url: string, bookId?: string }
 */
router.post("/url", summarizePdfFromUrlHandler);

/**
 * @route  POST /ai/summary/text
 * @desc   Summarize raw text content directly
 * @access Private
 * @body   { text: string, bookId?: string }
 */
router.post("/text", summarizeTextHandler);

module.exports = router;