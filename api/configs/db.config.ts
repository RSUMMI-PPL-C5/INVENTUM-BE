import { readFileSync } from 'fs';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'programming_languages',
  port: Number(process.env.DB_PORT) || 3306,
  ssl: {
    mode: 'VERIFY_IDENTITY',
    ca: readFileSync('/etc/ssl/cert.pem', 'utf-8'),
  },
};

export default dbConfig;