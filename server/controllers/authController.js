const authService = require('../services/authService');
const { validateRegister, validateLogin, validatePasswordResetRequest, validatePasswordReset, validateProfileUpdate, validateChangePassword } = require('../validators/authValidation');

class AuthController {
  // Register a new user
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('[register error]', error && error.stack ? error.stack : error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Refresh access token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      const result = await authService.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Logout user
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.logout(req.user._id, refreshToken);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Logout from all devices
  async logoutAll(req, res, next) {
    try {
      const result = await authService.logout(req.user._id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Request password reset
  async requestPasswordReset(req, res, next) {
    try {
      const result = await authService.requestPasswordReset(req.body.email);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Reset password
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      const result = await authService.resetPassword(token, password);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Change password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get current user profile
  async getProfile(req, res, next) {
    try {
      const result = await authService.getProfile(req.user._id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user profile
  async updateProfile(req, res, next) {
    try {
      const result = await authService.updateProfile(req.user._id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all users (admin only)
  async getAllUsers(req, res, next) {
    try {
      const User = require('../models/user');
      const { page = 1, limit = 10, search = '', role = '' } = req.query;

      const query = {};
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (role) {
        query.role = role;
      }

      const users = await User.find(query)
        .select('-password -refreshTokens')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalUsers: total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  // Get user by ID (admin only)
  async getUserById(req, res, next) {
    try {
      const User = require('../models/user');
      const user = await User.findById(req.params.id).select('-password -refreshTokens');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  }

  // Update user status (admin only)
  async updateUserStatus(req, res, next) {
    try {
      const User = require('../models/user');
      const { isActive, role } = req.body;

      const updateData = {};
      if (isActive !== undefined) updateData.isActive = isActive;
      if (role) updateData.role = role;

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -refreshTokens');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  // Delete user (admin only)
  async deleteUser(req, res, next) {
    try {
      const User = require('../models/user');
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }

  // Google OAuth authentication
  async googleAuth(req, res) {
    try {
      const { token, userInfo } = req.body;
      
      console.log('Google Auth Request:', { 
        hasToken: !!token, 
        hasUserInfo: !!userInfo,
        userInfoKeys: userInfo ? Object.keys(userInfo) : []
      });
      
      if (!userInfo) {
        console.error('Missing userInfo in request body');
        return res.status(400).json({
          success: false,
          message: 'Invalid Google authentication data: userInfo is required'
        });
      }

      if (!userInfo.email) {
        console.error('Missing email in userInfo:', userInfo);
        return res.status(400).json({
          success: false,
          message: 'Invalid Google authentication data: Email is required'
        });
      }

      const result = await authService.googleAuth(token, userInfo);
      res.status(200).json(result);
    } catch (error) {
      console.error('Google Auth Error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Google authentication failed'
      });
    }
  }
}

module.exports = new AuthController();
