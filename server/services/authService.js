const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');
const emailService = require('./emailService');

class AuthService {
  // Register a new user
  async register(userData) {
    try {
      const { firstName, lastName, email, phone } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Generate temporary password (12 characters: mix of uppercase, lowercase, numbers)
      const generateTemporaryPassword = () => {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const allChars = uppercase + lowercase + numbers;
        
        let password = '';
        // Ensure at least one of each type
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        
        // Fill the rest randomly
        for (let i = password.length; i < 12; i++) {
          password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
      };

      const temporaryPassword = generateTemporaryPassword();
      const temporaryPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

      // Hash the temporary password
      const saltRounds = 12;
      const hashedTemporaryPassword = await bcrypt.hash(temporaryPassword, saltRounds);

      // Create user with temporary password (role is always 'user')
      const user = new User({
        firstName,
        lastName,
        email,
        phone,
        role: 'user', // Always set to 'user'
        temporaryPassword: hashedTemporaryPassword,
        temporaryPasswordExpires: temporaryPasswordExpires,
        isActive: true,
        emailVerified: false,
        lastLogin: null
      });

      await user.save();

      // Send email with temporary password
      try {
        await emailService.sendEmail({
          to: user.email,
          subject: 'Welcome! Your Temporary Password',
          template: 'temporary-password',
          data: {
            name: `${user.firstName} ${user.lastName}`,
            temporaryPassword: temporaryPassword
          }
        });
      } catch (emailError) {
        console.error('[authService.register email error]', emailError);
        // Don't fail registration if email fails, but log it
      }

      // Remove sensitive data from response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.temporaryPassword;
      delete userResponse.temporaryPasswordExpires;
      delete userResponse.refreshTokens;

      return {
        success: true,
        message: 'User registered successfully. A temporary password has been sent to your email. Please check your inbox and use it to log in. The temporary password will expire in 1 day.',
        data: {
          user: userResponse
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
      // Find user by email (include password and temporary password for verification)
      const user = await User.findOne({ email }).select('+password +temporaryPassword');
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Check if user is OAuth-only (no password set)
      if (!user.password && !user.temporaryPassword && user.authProvider === 'google') {
        throw new Error('This account was created with Google Sign-In. Please use Google Sign-In to log in.');
      }

      // Check if password is provided
      if (!password) {
        throw new Error('Password is required');
      }

      let isPasswordValid = false;
      let isTemporaryPassword = false;

      // Check temporary password first (if exists and not expired)
      if (user.temporaryPassword && user.temporaryPasswordExpires && user.temporaryPasswordExpires > new Date()) {
        const isTemporaryPasswordValid = await bcrypt.compare(password, user.temporaryPassword);
        if (isTemporaryPasswordValid) {
          isPasswordValid = true;
          isTemporaryPassword = true;
        }
      }

      // If temporary password didn't match or doesn't exist, check regular password
      if (!isPasswordValid && user.password) {
        isPasswordValid = await user.comparePassword(password);
      }

      // Check if temporary password is expired
      if (user.temporaryPassword && user.temporaryPasswordExpires && user.temporaryPasswordExpires <= new Date()) {
        // Clear expired temporary password
        user.temporaryPassword = undefined;
        user.temporaryPasswordExpires = undefined;
        await user.save();
        
        if (!isPasswordValid) {
          throw new Error('Your temporary password has expired. Please use the password reset feature to set a new password.');
        }
      }

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date();
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      // Note: Temporary password remains valid until expiration (1 day)
      // User can login multiple times with temporary password until it expires

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

  // Refresh access token (with refresh token rotation: issue new refresh, invalidate old)
  async refreshToken(refreshToken) {
    try {
      const user = await User.findOne({
        'refreshTokens.token': refreshToken,
        'refreshTokens.expiresAt': { $gt: new Date() }
      }).select('+refreshTokens');

      if (!user) {
        throw new Error('Invalid or expired refresh token');
      }

      // Remove the used refresh token (rotation: one-time use)
      user.refreshTokens = user.refreshTokens.filter(
        (t) => t.token !== refreshToken
      );

      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
      };

      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken({ userId: user._id });

      // Store new refresh token
      const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      user.refreshTokens.push({
        token: newRefreshToken,
        createdAt: new Date(),
        expiresAt: refreshExpiresAt
      });

      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }

      await user.save();

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
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

      // Send reset email (fallback to localhost if FRONTEND_URL not set in .env)
      const baseUrl = (process.env.FRONTEND_URL).replace(/\/$/, '');
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
      await emailService.sendEmail({
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
      }).select('_id');

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash the new password the same way the User model does (so login compare works)
      const saltRounds = 12;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update in DB: set new password and clear reset/temporary fields explicitly.
      // Using updateOne + $unset ensures temporaryPassword etc. are removed so login
      // uses the regular password, not stale temporary password.
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            password: hashedPassword,
            refreshTokens: [],
            updatedAt: new Date()
          },
          $unset: {
            temporaryPassword: 1,
            temporaryPasswordExpires: 1,
            resetPasswordToken: 1,
            resetPasswordExpires: 1
          }
        }
      );

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
      const user = await User.findById(userId).select('+password +temporaryPassword');
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password (check both regular and temporary password)
      let isCurrentPasswordValid = false;
      
      if (user.password) {
        isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      }
      
      // If regular password didn't match, check temporary password
      if (!isCurrentPasswordValid && user.temporaryPassword && user.temporaryPasswordExpires > new Date()) {
        isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.temporaryPassword);
      }

      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Set new password (will be hashed by pre-save middleware)
      user.password = newPassword;
      
      // Clear temporary password when user sets their own password
      user.temporaryPassword = undefined;
      user.temporaryPasswordExpires = undefined;
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

  // Get all users (with pagination, search, and filtering)
  async getUsers(options = {}) {
    try {
      const { page = 1, limit = 10, search = '', role = '' } = options;

      // Build query
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

      // Calculate pagination
      const skip = (page - 1) * limit;
      const limitNum = parseInt(limit);

      // Fetch users
      const users = await User.find(query)
        .select('-password -refreshTokens')
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip(skip);

      // Get total count
      const total = await User.countDocuments(query);

      return {
        success: true,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limitNum),
            totalUsers: total,
            hasNext: page < Math.ceil(total / limitNum),
            hasPrev: page > 1
          }
        }
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to get users');
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

  // Utility: Clean up expired temporary passwords (background job)
  async cleanupExpiredTemporaryPasswords() {
    try {
      const result = await User.updateMany(
        { 
          temporaryPasswordExpires: { $lt: new Date() },
          temporaryPassword: { $exists: true, $ne: null }
        },
        { 
          $unset: { 
            temporaryPassword: 1, 
            temporaryPasswordExpires: 1 
          } 
        }
      );

      console.log(`[authService.cleanupExpiredTemporaryPasswords] Cleaned up ${result.modifiedCount} expired temporary passwords`);
      
      return {
        success: true,
        message: `Cleaned up ${result.modifiedCount} expired temporary passwords`
      };
    } catch (error) {
      console.error('[authService.cleanupExpiredTemporaryPasswords error]', error);
      throw new Error('Failed to cleanup expired temporary passwords');
    }
  }

  // Utility: Clean up expired reset tokens (background job)
  async cleanupExpiredResetTokens() {
    try {
      const result = await User.updateMany(
        { 
          resetPasswordExpires: { $lt: new Date() },
          resetPasswordToken: { $exists: true, $ne: null }
        },
        { 
          $unset: { 
            resetPasswordToken: 1, 
            resetPasswordExpires: 1 
          } 
        }
      );

      console.log(`[authService.cleanupExpiredResetTokens] Cleaned up ${result.modifiedCount} expired reset tokens`);
      
      return {
        success: true,
        message: `Cleaned up ${result.modifiedCount} expired reset tokens`
      };
    } catch (error) {
      console.error('[authService.cleanupExpiredResetTokens error]', error);
      throw new Error('Failed to cleanup expired reset tokens');
    }
  }
}

module.exports = new AuthService();
