import rateLimit from 'express-rate-limit';

// Standard API rate limiter: 120 requests per minute
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many requests from this IP address, please try again in a minute'
  }
});

// Dedicated Emergency SOS limiter: Allows bursts but prevents automated spam/DDoS
export const emergencyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Emergency request threshold reached. If in life-threatening danger, dial 112 immediately.'
  }
});
