/* istanbul ignore file */
/* sonar-disable */
import cors from "cors";
import express from "express";
import userRoutes from "./routes/user.route";
import 'dotenv/config';

const app = express();
const whitelist: string[] = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001'
];

const PROD = process.env.PROD_CLIENT_URL;

if (PROD) {
  whitelist.push(PROD);
}

// IMPORTANT: Apply CORS middleware BEFORE other middleware
app.use(cors({
  origin: whitelist,  // Simplified origin config
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Apply body parsers AFTER CORS
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send('PPL C-5 DEPLOYED!!!');
});

app.use('/user', userRoutes);

const PORT = 8000;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
  console.log(`CORS enabled for origins: ${whitelist.join(', ')}`);
});

export default server;