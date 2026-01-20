const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorize } = require('../middleware/auth');
// Rate limiting disabled
// const { authLimiter } = require('../middleware/security');
const {
  validateRegister,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateProfileUpdate,
  validateChangePassword
} = require('../validators/authValidation');

// Helper to wrap async handlers and always forward errors
const controller = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    console.error('[route error]', err && err.stack ? err.stack : err);
    next(err);
  }
};

// Public routes
router.post(
  '/register',
  ...validateRegister,
  controller(authController.register.bind(authController))
);

router.post(
  '/login',
  ...validateLogin,
  controller(authController.login.bind(authController))
);

router.post('/google', controller(authController.googleAuth.bind(authController)));

router.post('/refresh-token', controller(authController.refreshToken.bind(authController)));

router.post(
  '/request-password-reset',
  ...validatePasswordResetRequest,
  controller(authController.requestPasswordReset.bind(authController))
);

router.post(
  '/reset-password',
  ...validatePasswordReset,
  controller(authController.resetPassword.bind(authController))
);

// Protected routes (require authentication)
router.use(authenticateToken); // All routes below require authentication

router.post('/logout', controller(authController.logout.bind(authController)));

router.post('/logout-all', controller(authController.logoutAll.bind(authController)));

router.get('/profile', controller(authController.getProfile.bind(authController)));

router.put(
  '/profile',
  ...validateProfileUpdate,
  controller(authController.updateProfile.bind(authController))
);

router.put(
  '/change-password',
  ...validateChangePassword,
  controller(authController.changePassword.bind(authController))
);

// Admin routes
router.get('/users', authorize('admin'), controller(authController.getAllUsers.bind(authController)));

router.get('/users/:id', authorize('admin'), controller(authController.getUserById.bind(authController)));

router.put('/users/:id/status', authorize('admin'), controller(authController.updateUserStatus.bind(authController)));

router.delete('/users/:id', authorize('admin'), controller(authController.deleteUser.bind(authController)));

module.exports = router;
