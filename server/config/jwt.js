const jwt = require('jsonwebtoken');

// Access token: short-lived, used for API auth (Authorization: Bearer <token>)
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // 5–15 min typical

// Refresh token: long-lived, used only to obtain new access tokens (never for API calls)
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_fallback_refresh_secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'marketplace-api',
    audience: 'marketplace-client'
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'marketplace-api',
    audience: 'marketplace-client'
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  JWT_SECRET,
  JWT_REFRESH_SECRET
};
