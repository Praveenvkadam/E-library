/**
 * summaryController.js
 * Handles HTTP requests for AI-powered PDF summarization.
 */

const { extractTextFromFile, extractTextFromUrl } = require("../service/pdfExtractService");
const { summarizePdf } = require("../service/summaryService");
const { detectLanguage } = require("../utils/languageDetect");

/**
 * POST /ai/summary/upload
 * Upload a PDF file and get an AI-generated summary.
 * Form-data: file (PDF)
 * Body (optional): { bookId?: string }
 */
const summarizeUploadedPdfHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "PDF file is required." });
    }

    const { bookId } = req.body;
    const startTime = Date.now();

    // Step 1: Extract text
    const extracted = await extractTextFromFile(req.file.path);

    if (!extracted.text || extracted.text.length < 100) {
      return res.status(422).json({
        success: false,
        message: "Could not extract readable text from this PDF. It may be image-based or encrypted.",
      });
    }

    // Step 2: Detect language
    const detectedLanguage = detectLanguage(extracted.text.slice(0, 500));

    // Step 3: Generate summary
    const summaryResult = await summarizePdf(extracted.text, bookId, detectedLanguage.iso3);

    return res.status(200).json({
      success: true,
      data: {
        summary: summaryResult.summary,
        keyPoints: summaryResult.keyPoints,
        metadata: {
          ...extracted.metadata,
          pages: extracted.pages,
          detectedLanguage: detectedLanguage.name,
          languageCode: detectedLanguage.iso3,
        },
        performance: {
          fromCache: summaryResult.fromCache,
          processingTimeMs: summaryResult.processingTimeMs,
          model: summaryResult.model,
          totalTimeMs: Date.now() - startTime,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /ai/summary/url
 * Summarize a PDF from a remote URL (e.g., from BookUpload service S3 URL).
 * Body: { url: string, bookId?: string }
 */
const summarizePdfFromUrlHandler = async (req, res, next) => {
  try {
    const { url, bookId } = req.body;

    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ success: false, message: "Valid PDF URL is required." });
    }

    const startTime = Date.now();

    const extracted = await extractTextFromUrl(url);

    if (!extracted.text || extracted.text.length < 100) {
      return res.status(422).json({
        success: false,
        message: "Could not extract readable text from this PDF.",
      });
    }

    const detectedLanguage = detectLanguage(extracted.text.slice(0, 500));
    const summaryResult = await summarizePdf(extracted.text, bookId, detectedLanguage.iso3);

    return res.status(200).json({
      success: true,
      data: {
        summary: summaryResult.summary,
        keyPoints: summaryResult.keyPoints,
        sourceUrl: url,
        metadata: {
          ...extracted.metadata,
          pages: extracted.pages,
          detectedLanguage: detectedLanguage.name,
        },
        performance: {
          fromCache: summaryResult.fromCache,
          processingTimeMs: summaryResult.processingTimeMs,
          model: summaryResult.model,
          totalTimeMs: Date.now() - startTime,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /ai/summary/text
 * Summarize raw text directly (no PDF needed).
 * Body: { text: string, bookId?: string }
 */
const summarizeTextHandler = async (req, res, next) => {
  try {
    const { text, bookId } = req.body;

    if (!text || text.trim().length < 100) {
      return res.status(400).json({
        success: false,
        message: "Text must be at least 100 characters.",
      });
    }

    const startTime = Date.now();
    const detectedLanguage = detectLanguage(text.slice(0, 500));
    const summaryResult = await summarizePdf(text, bookId, detectedLanguage.iso3);

    return res.status(200).json({
      success: true,
      data: {
        summary: summaryResult.summary,
        keyPoints: summaryResult.keyPoints,
        metadata: {
          charCount: text.length,
          wordCount: text.split(/\s+/).length,
          detectedLanguage: detectedLanguage.name,
        },
        performance: {
          fromCache: summaryResult.fromCache,
          processingTimeMs: summaryResult.processingTimeMs,
          model: summaryResult.model,
          totalTimeMs: Date.now() - startTime,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  summarizeUploadedPdfHandler,
  summarizePdfFromUrlHandler,
  summarizeTextHandler,
};