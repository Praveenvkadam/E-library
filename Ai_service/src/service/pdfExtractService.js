const pdfParse = require("pdf-parse/lib/pdf-parse.js");
const fs = require("fs");

/**
 * Extract text from a PDF file path.
 */
const extractTextFromFile = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  return extractTextFromBuffer(dataBuffer);
};

/**
 * Extract text from a PDF buffer.
 */
const extractTextFromBuffer = async (buffer) => {
  const data = await pdfParse(buffer);
  const cleanedText = cleanExtractedText(data.text);

  return {
    text: cleanedText,
    pages: data.numpages,
    metadata: {
      title:     data.info?.Title   || null,
      author:    data.info?.Author  || null,
      subject:   data.info?.Subject || null,
      creator:   data.info?.Creator || null,
      wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
      charCount: cleanedText.length,
    },
  };
};

/**
 * Clean raw PDF-extracted text.
 */
const cleanExtractedText = (rawText) => {
  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/([a-z])-\n([a-z])/g, "$1$2")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/^\s*\d+\s*$/gm, "")
    .trim();
};

/**
 * Download and extract text from a remote PDF URL.
 * @param {string} url
 * @param {string} [authToken] — JWT forwarded from the incoming request
 */
const extractTextFromUrl = async (url, authToken) => {
  const axios = require("axios");

  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 30000,
    headers: {
      // ✅ Forward JWT so the gateway allows the request
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
  });

  const buffer = Buffer.from(response.data);
  return extractTextFromBuffer(buffer);
};

module.exports = { extractTextFromFile, extractTextFromBuffer, extractTextFromUrl };