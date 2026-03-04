const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

dotenv.config();

const analysisRoutes = require("./routes/analysisRoutes");
const ttsRoutes = require("./routes/ttsRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const { registerWithEureka, deregisterFromEureka } = require("./utils/eurekaClient");

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("combined"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/ai/health", (req, res) => {
  res.status(200).json({
    service: "AiService",
    status: "UP",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/ai/analysis", analysisRoutes);
app.use("/ai/tts", ttsRoutes);
app.use("/ai/summary", summaryRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── Database Connection ─────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[DB] MongoDB connected successfully");
  } catch (err) {
    console.error("[DB] MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;

const start = async () => {
  await connectDB();

  app.listen(PORT, async () => {
    console.log(`[SERVER] AiService running on port ${PORT}`);

    // Register with Eureka AFTER server is listening
    try {
      await registerWithEureka();
    } catch (err) {
      // Non-fatal — service still works, just won't be discovered via lb://
      console.warn("[Eureka] Service running without Eureka registration.");
    }
  });
};

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n[SERVER] ${signal} received — shutting down gracefully...`);
  await deregisterFromEureka();
  await mongoose.connection.close();
  console.log("[SERVER] Shutdown complete.");
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));  

start();

module.exports = app;