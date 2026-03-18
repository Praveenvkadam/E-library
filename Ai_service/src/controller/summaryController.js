const { extractTextFromFile, extractTextFromUrl } = require("../service/pdfExtractService");
const { summarizePdf } = require("../service/summaryService");
const { detectLanguage } = require("../utils/languageDetect");

/**
 * POST /ai/summary/upload
 */
const summarizeUploadedPdfHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "PDF file is required." });
    }

    const { bookId } = req.body;
    const startTime = Date.now();

    const extracted = await extractTextFromFile(req.file.path);

    if (!extracted.text || extracted.text.length < 100) {
      return res.status(422).json({
        success: false,
        message: "Could not extract readable text from this PDF. It may be image-based or encrypted.",
      });
    }

    const detectedLanguage = detectLanguage(extracted.text.slice(0, 500));
    const summaryResult    = await summarizePdf(extracted.text, bookId, detectedLanguage.iso3);

    return res.status(200).json({
      success: true,
      data: {
        summary:   summaryResult.summary,
        keyPoints: summaryResult.keyPoints,
        metadata: {
          ...extracted.metadata,
          pages:            extracted.pages,
          detectedLanguage: detectedLanguage.name,
          languageCode:     detectedLanguage.iso3,
        },
        performance: {
          fromCache:        summaryResult.fromCache,
          processingTimeMs: summaryResult.processingTimeMs,
          model:            summaryResult.model,
          totalTimeMs:      Date.now() - startTime,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /ai/summary/url
 */
const summarizePdfFromUrlHandler = async (req, res, next) => {
  try {
    const { url, bookId } = req.body;

    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ success: false, message: "Valid PDF URL is required." });
    }

    const startTime = Date.now();

    // ✅ Forward JWT to Book Service so gateway allows the internal PDF fetch
    const authToken = req.headers["authorization"]?.replace("Bearer ", "").trim();

    const extracted = await extractTextFromUrl(url, authToken); // ✅ token forwarded

    if (!extracted.text || extracted.text.length < 100) {
      return res.status(422).json({
        success: false,
        message: "Could not extract readable text from this PDF.",
      });
    }

    const detectedLanguage = detectLanguage(extracted.text.slice(0, 500));
    const summaryResult    = await summarizePdf(extracted.text, bookId, detectedLanguage.iso3);

    return res.status(200).json({
      success: true,
      data: {
        summary:   summaryResult.summary,
        keyPoints: summaryResult.keyPoints,
        sourceUrl: url,
        metadata: {
          ...extracted.metadata,
          pages:            extracted.pages,
          detectedLanguage: detectedLanguage.name,
        },
        performance: {
          fromCache:        summaryResult.fromCache,
          processingTimeMs: summaryResult.processingTimeMs,
          model:            summaryResult.model,
          totalTimeMs:      Date.now() - startTime,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /ai/summary/text
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

    const startTime        = Date.now();
    const detectedLanguage = detectLanguage(text.slice(0, 500));
    const summaryResult    = await summarizePdf(text, bookId, detectedLanguage.iso3);

    return res.status(200).json({
      success: true,
      data: {
        summary:   summaryResult.summary,
        keyPoints: summaryResult.keyPoints,
        metadata: {
          charCount:        text.length,
          wordCount:        text.split(/\s+/).length,
          detectedLanguage: detectedLanguage.name,
        },
        performance: {
          fromCache:        summaryResult.fromCache,
          processingTimeMs: summaryResult.processingTimeMs,
          model:            summaryResult.model,
          totalTimeMs:      Date.now() - startTime,
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