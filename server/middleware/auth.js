const { verifyAccessToken } = require('../config/jwt');
const User = require('../models/user');

const LOGIN_REQUIRED_MESSAGE = 'Login again to access this page.';

const PUBLIC_API_ROUTES = new Set([
  'POST /api/auth/register',
  'POST /api/auth/login',
  'POST /api/auth/google',
  'POST /api/auth/refresh-token',
  'POST /api/auth/request-password-reset',
  'POST /api/auth/reset-password',
  'POST /api/coupons/validate',
]);

function isPublicApiRoute(req) {
  const path = req.originalUrl.split('?')[0];
  return PUBLIC_API_ROUTES.has(`${req.method.toUpperCase()} ${path}`);
}

function isStorefrontBrowseRoute(req) {
  if (req.method.toUpperCase() !== 'GET') return false;

  const path = req.originalUrl.split('?')[0];

  const exactPaths = new Set([
    '/api/banners',
    '/api/homeSideBanners',
    '/api/homeBottomBanners',
    '/api/homeBanner',
    '/api/homepage-content',
    '/api/search',
    '/api/category/active',
    '/api/settings',
  ]);

  if (exactPaths.has(path)) return true;

  if (path.startsWith('/api/products') && !path.startsWith('/api/products/admin')) {
    return true;
  }

  if (path.startsWith('/api/productReviews')) {
    return true;
  }

  if (path.startsWith('/api/artisans')) {
    return true;
  }

  if (path.startsWith('/api/cms-pages')) {
    return true;
  }

  if (path.startsWith('/api/category/')) {
    if (
      path.startsWith('/api/category/admin') ||
      path.includes('/get/count') ||
      path.includes('/subCat/get/count')
    ) {
      return false;
    }
    return path !== '/api/category';
  }

  return false;
}

function sendLoginRequired(res, extra = {}) {
  return res.status(401).json({
    success: false,
    message: LOGIN_REQUIRED_MESSAGE,
    ...extra,
  });
}

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return sendLoginRequired(res);
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return sendLoginRequired(res);
    }

    if (!user.isActive) {
      return sendLoginRequired(res);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendLoginRequired(res, { code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
      return sendLoginRequired(res);
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Global guard for all /api routes except public auth and storefront browsing.
const apiAuthGuard = (req, res, next) => {
  if (isPublicApiRoute(req)) {
    return next();
  }
  if (isStorefrontBrowseRoute(req)) {
    return optionalAuth(req, res, next);
  }
  return authenticateToken(req, res, next);
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendLoginRequired(res);
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

module.exports = {
  LOGIN_REQUIRED_MESSAGE,
  PUBLIC_API_ROUTES,
  isPublicApiRoute,
  isStorefrontBrowseRoute,
  apiAuthGuard,
  authenticateToken,
  optionalAuth,
  authorize
};
