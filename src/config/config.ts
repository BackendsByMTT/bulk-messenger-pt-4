import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.MONGO_CONNECTION_STRING,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
};

export const config = Object.freeze(_config);