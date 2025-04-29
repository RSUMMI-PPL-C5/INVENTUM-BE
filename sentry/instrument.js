const Sentry = require("@sentry/node");
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

module.exports = { setupSentry, errorHandler, Sentry };
