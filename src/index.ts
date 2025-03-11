import cors from "cors";
import express from "express";
import userRoutes from "./routes/user.route";
import "dotenv/config";

const app = express();
const whitelist = process.env.PROD_CLIENT_URL?.split(",") || [];

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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("PPL C-5 DEPLOYED!!!");
});

app.use("/user", userRoutes);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

export default server;
