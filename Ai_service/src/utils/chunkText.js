/**
 * chunkText.js
 * Splits large text into overlapping chunks for AI summarization.
 */

/**
 * Split text into chunks of a given size with optional overlap.
 * Tries to split on sentence boundaries to preserve context.
 *
 * @param {string} text          - The full text to chunk
 * @param {number} chunkSize     - Max characters per chunk (default: 2500)
 * @param {number} overlapSize   - Characters of overlap between chunks (default: 150)
 * @returns {string[]}           - Array of text chunks
 */
const chunkText = (text, chunkSize = 2500, overlapSize = 150) => {
  if (!text || text.trim().length === 0) return [];

  // If text fits in one chunk, return as-is
  if (text.length <= chunkSize) return [text.trim()];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Don't exceed text length
    if (end >= text.length) {
      chunks.push(text.slice(start).trim());
      break;
    }

    // Try to break on a sentence boundary (. ! ?) within last 200 chars of chunk
    const slice = text.slice(start, end);
    const sentenceEnd = slice.search(/[.!?][^.!?]*$/);

    if (sentenceEnd > chunkSize - 200) {
      // Found a good sentence boundary near the end
      end = start + sentenceEnd + 1;
    } else {
      // Fall back to word boundary
      const lastSpace = slice.lastIndexOf(" ");
      if (lastSpace > chunkSize - 200) {
        end = start + lastSpace;
      }
    }

    chunks.push(text.slice(start, end).trim());

    // Move forward with overlap so context isn't lost between chunks
    start = end - overlapSize;
  }

  return chunks.filter((c) => c.length > 0);
};

module.exports = { chunkText };