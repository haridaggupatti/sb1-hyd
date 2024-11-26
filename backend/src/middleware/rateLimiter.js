import { RateLimiterRedis } from 'rate-limiter-flexible';
import redis from '../config/redis.js';
import { config } from '../config/config.js';

// General API rate limiter
const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl',
  points: config.rateLimits.max,
  duration: config.rateLimits.window / 1000,
});

// OpenAI specific rate limiter
const openaiLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl_openai',
  points: config.rateLimits.openai.max,
  duration: config.rateLimits.openai.window / 1000,
});

export const rateLimiterMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.ip;
    await rateLimiter.consume(userId);
    next();
  } catch (err) {
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: err.msBeforeNext / 1000,
    });
  }
};

export const openaiLimiterMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.ip;
    await openaiLimiter.consume(userId);
    next();
  } catch (err) {
    res.status(429).json({
      error: 'AI service rate limit exceeded. Please try again later.',
      retryAfter: err.msBeforeNext / 1000,
    });
  }
};