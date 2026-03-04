/**
 * fileUpload.js
 * Multer configuration for PDF uploads.
 * Validates file type and size before saving to disk.
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Ensure upload directory exists
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "../../uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["application/pdf"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed."), false);
  }
};

const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "20", 10);

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

/**
 * Middleware to clean up uploaded file after response is sent.
 * Attach to routes where temp cleanup is desired.
 */
const cleanupAfterResponse = (req, res, next) => {
  res.on("finish", () => {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn("[FileUpload] Cleanup failed:", err.message);
      });
    }
  });
  next();
};

module.exports = { upload, cleanupAfterResponse };