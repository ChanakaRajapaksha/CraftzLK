const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');
const { sendEmail } = require('./emailService');

class AuthService {
  // Register a new user
  async register(userData) {
    try {
      const { firstName, lastName, email, password, phone, role = 'user' } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create user (password will be hashed by pre-save middleware)
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        phone,
        role,
        isActive: true,
        emailVerified: false,
        lastLogin: null
      });

      await user.save();

      // Generate tokens
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken({ userId: user._id });

      // Store refresh token
      user.refreshTokens.push({
        token: refreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.refreshTokens;

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          user: userResponse,
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      // Preserve original stack and surface the root cause
      console.error('[authService.register error]', error && error.stack ? error.stack : error);
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Find user by email (include password for verification)
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Check if user is OAuth-only (no password set)
      if (!user.password && user.authProvider === 'google') {
        throw new Error('This account was created with Google Sign-In. Please use Google Sign-In to log in.');
      }

      // Check if password is provided
      if (!password) {
        throw new Error('Password is required');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date();
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      // Generate tokens
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken({ userId: user._id });

      // Store refresh token
      user.refreshTokens.push({
        token: refreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      // Keep only last 5 refresh tokens
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }

      await user.save();

      // Remove password from response and ensure virtuals are included
      const userResponse = user.toObject({ virtuals: true });
      delete userResponse.password;
      delete userResponse.refreshTokens;

      // Ensure fullName is available (it's a virtual)
      if (!userResponse.fullName && user.firstName && user.lastName) {
        userResponse.fullName = `${user.firstName} ${user.lastName}`;
      }

      // Ensure id is available (MongoDB uses _id)
      if (!userResponse.id && userResponse._id) {
        userResponse.id = userResponse._id.toString();
      }

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      const user = await User.findOne({
        'refreshTokens.token': refreshToken,
        'refreshTokens.expiresAt': { $gt: new Date() }
      });

      if (!user) {
        throw new Error('Invalid or expired refresh token');
      }

      // Generate new access token
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
      };

      const newAccessToken = generateAccessToken(tokenPayload);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken
        }
      };
    } catch (error) {
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  // Logout user
  async logout(userId, refreshToken) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove specific refresh token
      if (refreshToken) {
        user.refreshTokens = user.refreshTokens.filter(
          token => token.token !== refreshToken
        );
      } else {
        // Remove all refresh tokens (logout from all devices)
        user.refreshTokens = [];
      }

      await user.save();

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not
        return {
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpires;

      await user.save();

      // Send reset email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        template: 'password-reset',
        data: {
          name: user.firstName,
          resetUrl
        }
      });

      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      };
    } catch (error) {
      throw new Error(error.message || 'Password reset request failed');
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.refreshTokens = []; // Invalidate all refresh tokens

      await user.save();

      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      user.password = hashedPassword;
      user.refreshTokens = []; // Invalidate all refresh tokens

      await user.save();

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Password change failed');
    }
  }

  // Get user profile
  async getProfile(userId) {
    try {
      const user = await User.findById(userId).select('-password -refreshTokens');
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: { user }
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to get profile');
    }
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    try {
      const allowedUpdates = ['firstName', 'lastName', 'phone', 'address'];
      const updates = {};

      Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key) && updateData[key] !== undefined) {
          updates[key] = updateData[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
      ).select('-password -refreshTokens');

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      };
    } catch (error) {
      throw new Error(error.message || 'Profile update failed');
    }
  }

  // Google OAuth authentication
  async googleAuth(googleToken, userInfo) {
    try {
      // Verify Google token (we'll use a simple approach with userInfo from frontend)
      // In production, you should verify the token with Google's API
      // Google userinfo API returns 'id', not 'sub'
      const { email, name, picture, id: googleId, sub } = userInfo;
      
      console.log('Received userInfo:', {
        email: !!email,
        name: !!name,
        picture: !!picture,
        id: googleId,
        sub: sub,
        allKeys: Object.keys(userInfo || {})
      });

      if (!email) {
        console.error('Missing email in userInfo:', userInfo);
        throw new Error('Invalid Google authentication data: Email is required');
      }

      // Use 'id' from userinfo API, or 'sub' if present (from JWT)
      const googleUserId = googleId || sub;

      if (!googleUserId) {
        console.error('Missing Google ID in userInfo. Full userInfo:', JSON.stringify(userInfo, null, 2));
        throw new Error('Invalid Google authentication data: Google ID (id or sub) is required');
      }

      console.log('Processing Google auth:', {
        email,
        googleUserId,
        hasName: !!name,
        hasPicture: !!picture
      });

      // Split name into firstName and lastName
      const nameParts = name ? name.split(' ') : ['User', ''];
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Check if user exists by email or googleId
      let user = await User.findOne({
        $or: [
          { email: email.toLowerCase() },
          { googleId: googleUserId }
        ]
      });

      if (user) {
        // Update user if they're logging in with Google for the first time
        if (!user.googleId) {
          user.googleId = googleUserId;
          user.authProvider = 'google';
        }
        
        // Update profile picture if provided
        if (picture && (!user.images || user.images.length === 0)) {
          user.images = [picture];
        }

        user.lastLogin = new Date();
        user.emailVerified = true; // Google emails are verified
        user.isVerified = true;
        await user.save();
      } else {
        // Create new user
        user = new User({
          firstName,
          lastName,
          email: email.toLowerCase(),
          googleId: googleUserId,
          authProvider: 'google',
          images: picture ? [picture] : [],
          emailVerified: true,
          isVerified: true,
          isActive: true,
          lastLogin: new Date(),
          role: 'user'
        });

        await user.save();
      }

      // Generate tokens
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken({ userId: user._id });

      // Store refresh token
      user.refreshTokens.push({
        token: refreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      // Keep only last 5 refresh tokens
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }

      await user.save();

      // Remove password from response and ensure virtuals are included
      const userResponse = user.toObject({ virtuals: true });
      delete userResponse.password;
      delete userResponse.refreshTokens;

      // Ensure fullName is available (it's a virtual)
      if (!userResponse.fullName && user.firstName && user.lastName) {
        userResponse.fullName = `${user.firstName} ${user.lastName}`;
      }

      // Ensure id is available (MongoDB uses _id)
      if (!userResponse.id && userResponse._id) {
        userResponse.id = userResponse._id.toString();
      }

      return {
        success: true,
        message: 'Google authentication successful',
        data: {
          user: userResponse,
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      console.error('[authService.googleAuth error]', error);
      throw new Error(error.message || 'Google authentication failed');
    }
  }
}

module.exports = new AuthService();
