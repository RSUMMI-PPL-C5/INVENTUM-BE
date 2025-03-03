import { config } from 'dotenv';

config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  ssl: process.env.DB_SSL === 'true' ? {
    mode: 'VERIFY_IDENTITY',
    ca: process.env.DB_SSL_CA ?? '',
  } : undefined,
};


export default dbConfig;