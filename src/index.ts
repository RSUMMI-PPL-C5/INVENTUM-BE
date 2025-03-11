/* istanbul ignore file */
/* sonar-disable */
/* sonar:disable */
/* eslint-disable */
/* sonar.coverage.exclusions */
/* coverage-disable */
import cors from "cors";
import express from "express";
import userRoutes from "./routes/user.route";
import authRoutes from "./routes/auth.route";
import 'dotenv/config';

const app = express();

app.disable('x-powered-by');

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
      console.error(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("PPL C-5 DEPLOYED!!!");
});

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
  console.log(`CORS enabled for origins: ${whitelist.join(', ')}`);
});

export default server;
