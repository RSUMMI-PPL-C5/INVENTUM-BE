import rateLimit from "express-rate-limit";

// Limiter untuk endpoint login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 8, // 8 percobaan login per window
  keyGenerator: (req) => {
    return req.body.username ?? req.ip; // Jika body sudah terparsing dan terdapat username maka pake itu, else pakai berdasarkan ip
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: "error",
    statusCode: 429,
    message: "Too many login attempts. Please try again after 15 minutes",
  },
});

// Limiter umum (jika perlu untuk API lain)
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 30, // 30 request per IP dalam 1 menit
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: "error",
    statusCode: 429,
    message: "Too many requests. Please try again later",
  },
});
