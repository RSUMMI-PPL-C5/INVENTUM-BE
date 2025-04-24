const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
require("dotenv/config");

function setupSentry() {
  // Inisialisasi Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN, // Pastikan DSN diatur di .env
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0, // Sampling rate untuk tracing
    profilesSampleRate: 1.0, // Sampling rate untuk profiling
  });
}

function customErrorHandler(err, req, res, next) {
  console.error(err); // Log error ke console
  res.statusCode = 500;
  res.end(`Error ID: ${res.sentry}` + "\n");
}

module.exports = { setupSentry, customErrorHandler, Sentry };
