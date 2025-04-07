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

import "dotenv/config";
setupSentry();

import cors from "cors";
import express from "express";
import userRoutes from "./routes/user.route";
import authRoutes from "./routes/auth.route";
import divisionRoutes from "./routes/division.routes";
import medicalequipmentRoutes from "./routes/medicalequipment.route";

const app = express();

app.disable("x-powered-by");

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
app.use("/divisi", divisionRoutes);
app.use("/medical-equipment", medicalequipmentRoutes);

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
