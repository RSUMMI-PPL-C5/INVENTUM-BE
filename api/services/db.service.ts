import mysql from 'mysql2/promise';
import dbConfig from '../configs/db.config';

const connectToDatabase = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the MySQL database.');
    return connection;
  } catch (error) {
    console.error('Error connecting to the MySQL database:', error);
    throw error;
  }
};

export default connectToDatabase;