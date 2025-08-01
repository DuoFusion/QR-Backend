const dotenv = require('dotenv');
dotenv.config();

export const config = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  BACKEND_URL: process.env.BACKEND_URL,
  JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET
}