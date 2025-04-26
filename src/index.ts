/* istanbul ignore file */
/* sonar-disable */
/* sonar:disable */
/* eslint-disable */
/* sonar.coverage.exclusions */
/* coverage-disable */

import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { Sentry, setupSentry, errorHandler } from "../sentry/instrument";

// Import routes
import userRoutes from "./routes/user.route";
import authRoutes from "./routes/auth.route";
import sparepartRoutes from "./routes/sparepart.route";
import divisionRoutes from "./routes/division.route";
import medicalequipmentRoutes from "./routes/medicalequipment.route";

// Initialize Sentry
setupSentry();
const app = express();

// Basic security settings
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    xssFilter: true,
    noSniff: true,
    ieNoOpen: true,
    frameguard: { action: "deny" },
    hsts: true,
  }),
);

// Additional security headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  );
  next();
});

// CORS configuration
const whitelist = process.env.PROD_CLIENT_URL
  ? [process.env.PROD_CLIENT_URL]
  : [];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
  }),
);

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get("/", (req, res) => {
  res.send("PPL C-5 DEPLOYED!!!");
});
app.get("/debug-sentry", function (req, res) {
  throw new Error("My first Sentry error!");
});

// API routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/spareparts", sparepartRoutes);
app.use("/divisi", divisionRoutes);
app.use("/medical-equipment", medicalequipmentRoutes);

// Error handling
Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

// Server initialization
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
  console.log(`CORS enabled for origins: ${whitelist.join(", ")}`);
});

export default server;
