/**
 * pdfExtractService.js
 * Extracts and cleans text content from uploaded PDF files.
 */

const pdfParse = require("pdf-parse");
const fs = require("fs");

/**
 * Extract text from a PDF file path.
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<{ text: string, pages: number, metadata: object }>}
 */
const extractTextFromFile = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  return extractTextFromBuffer(dataBuffer);
};

/**
 * Extract text from a PDF buffer (for URL-downloaded PDFs).
 * @param {Buffer} buffer
 * @returns {Promise<{ text: string, pages: number, metadata: object }>}
 */
const extractTextFromBuffer = async (buffer) => {
  const data = await pdfParse(buffer);

  const cleanedText = cleanExtractedText(data.text);

  return {
    text: cleanedText,
    pages: data.numpages,
    metadata: {
      title: data.info?.Title || null,
      author: data.info?.Author || null,
      subject: data.info?.Subject || null,
      creator: data.info?.Creator || null,
      wordCount: cleanedText.split(/\s+/).length,
      charCount: cleanedText.length,
    },
  };
};

/**
 * Clean raw PDF-extracted text — remove extra whitespace, fix hyphenation,
 * remove page headers/footers noise.
 * @param {string} rawText
 * @returns {string}
 */
const cleanExtractedText = (rawText) => {
  return rawText
    .replace(/\r\n/g, "\n")                          // normalize line endings
    .replace(/([a-z])-\n([a-z])/g, "$1$2")           // fix hyphenated words
    .replace(/\n{3,}/g, "\n\n")                       // collapse multiple blank lines
    .replace(/[ \t]{2,}/g, " ")                       // collapse multiple spaces
    .replace(/^\s*\d+\s*$/gm, "")                     // remove standalone page numbers
    .trim();
};

/**
 * Download and extract text from a remote PDF URL.
 * @param {string} url
 * @returns {Promise<{ text: string, pages: number, metadata: object }>}
 */
const extractTextFromUrl = async (url) => {
  const axios = require("axios");
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 30000,
  });

  const buffer = Buffer.from(response.data);
  return extractTextFromBuffer(buffer);
};

module.exports = { extractTextFromFile, extractTextFromBuffer, extractTextFromUrl };