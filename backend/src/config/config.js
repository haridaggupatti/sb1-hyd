import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  openaiApiKey: process.env.OPENAI_API_KEY,
  rateLimits: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    openai: {
      window: 60 * 1000, // 1 minute
      max: 20, // OpenAI requests per minute
    },
  },
};