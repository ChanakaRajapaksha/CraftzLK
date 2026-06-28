const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const asyncHandler = require('../middleware/asyncHandler');
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

// Public routes
router.post(
  '/register',
  ...validateRegister,
  asyncHandler(authController.register.bind(authController))
);

router.post(
  '/login',
  ...validateLogin,
  asyncHandler(authController.login.bind(authController))
);

router.post('/google', asyncHandler(authController.googleAuth.bind(authController)));

router.post('/refresh-token', asyncHandler(authController.refreshToken.bind(authController)));

router.post(
  '/request-password-reset',
  ...validatePasswordResetRequest,
  asyncHandler(authController.requestPasswordReset.bind(authController))
);

router.post(
  '/reset-password',
  ...validatePasswordReset,
  asyncHandler(authController.resetPassword.bind(authController))
);

// Protected routes (require authentication)
router.use(authenticateToken); // All routes below require authentication

router.post('/logout', asyncHandler(authController.logout.bind(authController)));

router.post('/logout-all', asyncHandler(authController.logoutAll.bind(authController)));

router.get('/profile', asyncHandler(authController.getProfile.bind(authController)));

router.put(
  '/profile',
  ...validateProfileUpdate,
  asyncHandler(authController.updateProfile.bind(authController))
);

router.put(
  '/change-password',
  ...validateChangePassword,
  asyncHandler(authController.changePassword.bind(authController))
);

// Admin routes
router.get('/users', authorize('admin'), asyncHandler(authController.getAllUsers.bind(authController)));

router.get('/users/:id', authorize('admin'), asyncHandler(authController.getUserById.bind(authController)));

router.put('/users/:id/status', authorize('admin'), asyncHandler(authController.updateUserStatus.bind(authController)));

router.delete('/users/:id', authorize('admin'), asyncHandler(authController.deleteUser.bind(authController)));

module.exports = router;
