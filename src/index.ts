/* istanbul ignore file */
/* sonar-disable */
/* sonar:disable */
/* eslint-disable */
/* sonar.coverage.exclusions */
/* coverage-disable */
const {
  Sentry,
  setupSentry,
  customErrorHandler,
} = require("../sentry/instrument");

setupSentry();

import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import userRoutes from "./routes/user.route";
import authRoutes from "./routes/auth.route";
import sparepartRoutes from "./routes/sparepart.route";
import divisionRoutes from "./routes/division.route";
import medicalequipmentRoutes from "./routes/medicalequipment.route";
import commentRoutes from "./routes/comment.route";
import requestRoutes from "./routes/request.route";
const app = express();

app.disable("x-powered-by");

// Gunakan konfigurasi Helmet yang lebih spesifik
app.use(
  helmet.contentSecurityPolicy({
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
      frameAncestors: ["'self'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      blockAllMixedContent: [],
    },
  }),
);

// Header setup for security
app.use((req, res, next) => {
  // Cross-Origin Protection untuk mitigasi Spectre
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

  // Permissions Policy
  res.setHeader(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  );

  next();
});

app.use(helmet.xssFilter()); // Filter XSS
app.use(helmet.noSniff()); // Mencegah MIME sniffing
app.use(helmet.ieNoOpen()); // Mencegah IE dari menjalankan unduhan dalam konteks situs
app.use(helmet.frameguard({ action: "deny" })); // Mencegah clickjacking
app.use(helmet.hsts()); // HTTP Strict Transport Security

const whitelist: string[] = [];

const PROD = process.env.PROD_CLIENT_URL;

if (PROD) {
  whitelist.push(PROD);
}

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Tambahkan endpoint debug Sentry
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.get("/", (req, res) => {
  res.send("PPL C-5 DEPLOYED!!!");
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/spareparts", sparepartRoutes);
app.use("/divisi", divisionRoutes);
app.use("/medical-equipment", medicalequipmentRoutes);
app.use("/comment", commentRoutes);
app.use("/request", requestRoutes);

app.use((req, res, next) => {
  res.status(404).send({
    status: "error",
    message: "Route not found",
  });
});

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Middleware custom untuk menangani error
app.use(customErrorHandler);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
  console.log(`CORS enabled for origins: ${whitelist.join(", ")}`);
});

export default server;
