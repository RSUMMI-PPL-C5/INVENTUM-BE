const Sentry = require("@sentry/node");
const { Severity } = require("@sentry/node"); // Add this line to import Severity
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
require("dotenv/config");

function setupSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, {
    path: req.path,
    method: req.method,
    errorStack: err.stack,
  });

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server",
    errorId: res.sentry,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Add Severity to the exports
module.exports = { setupSentry, errorHandler, Sentry, Severity };
