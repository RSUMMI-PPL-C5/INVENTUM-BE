/* istanbul ignore file */
/* sonar-disable */
/* sonar:disable */
/* eslint-disable */
/* sonar.coverage.exclusions */
/* coverage-disable */

// Load environment variables
import "dotenv/config";

// Initialize Sentry
const { Sentry, setupSentry, errorHandler } = require("../sentry/instrument");

setupSentry();

import cors from "cors";
import express from "express";
import helmet from "helmet";

// Import routes
import userRoutes from "./routes/user.route";
import authRoutes from "./routes/auth.route";
import reportRoutes from "./routes/report.route";
import sparepartRoutes from "./routes/sparepart.route";
import divisionRoutes from "./routes/division.route";
import commentRoutes from "./routes/comment.route";
import requestRoutes from "./routes/request.route";
import medicalequipmentRoutes from "./routes/medical-equipment.route";
import maintenanceHistoryRoutes from "./routes/maintenance-history.route";
import calibrationHistoryRoutes from "./routes/calibration-history.routes";
import partsHistoryRoutes from "./routes/parts-history.routes";
import notificationRoutes from "./routes/notification.route";

// Import API Generation
import expressOasGenerator from "express-oas-generator";

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

// Additional securities
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  );
  next();
});
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.hsts());

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

expressOasGenerator.init(app as any, {});

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
app.use("/comment", commentRoutes);
app.use("/request", requestRoutes);
app.use("/medical-equipment", [
  medicalequipmentRoutes,
  maintenanceHistoryRoutes,
  calibrationHistoryRoutes,
  partsHistoryRoutes,
]);
app.use("/report", reportRoutes);
app.use("/notification", notificationRoutes);

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
