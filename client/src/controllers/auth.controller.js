/**
 * Authentication Controller
 * Handles all authentication-related API calls
 * Following MVC Architecture Pattern
 */

import { postData, setAccessToken, clearAccessToken, getAccessToken } from "../utils/api";

/**
 * Auth Controller Class
 * Centralizes authentication API endpoints and business logic
 */
class AuthController {
  // API Base Path
  static BASE_PATH = "/api/auth";

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name
   * @param {string} userData.email - User's email address
   * @param {string} userData.phone - User's phone number
   * @returns {Promise<Object>} Registration response with user data and tokens
   */
  static async register(userData) {
    try {
      const payload = {
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        email: userData.email.trim(),
        phone: userData.phone.trim(),
      };

      const response = await postData(`${this.BASE_PATH}/register`, payload);

      return {
        success: response.success || false,
        message: response.message || "Registration completed",
        data: response.data || null,
      };
    } catch (error) {
      console.error("[AuthController.register] Error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Registration failed. Please try again.",
        data: null,
      };
    }
  }

  /**
   * Login user with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email address
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} Login response with user data and tokens
   */
  static async login(credentials) {
    try {
      const payload = {
        email: credentials.email.trim(),
        password: credentials.password,
      };

      const response = await postData(`${this.BASE_PATH}/login`, payload);

      // Store tokens if login successful
      if (response.success && response.data) {
        this._storeAuthTokens(response.data);
        this._storeUserData(response.data.user);
      }

      return {
        success: response.success || false,
        message: response.message || "Login completed",
        data: response.data || null,
      };
    } catch (error) {
      console.error("[AuthController.login] Error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Login failed. Please try again.",
        data: null,
      };
    }
  }

  /**
   * Google OAuth authentication
   * @param {string} accessToken - Google access token
   * @param {Object} userInfo - Google user information
   * @returns {Promise<Object>} Authentication response with user data and tokens
   */
  static async googleAuth(accessToken, userInfo) {
    try {
      const payload = {
        token: accessToken,
        userInfo: userInfo,
      };

      const response = await postData(`${this.BASE_PATH}/google`, payload);

      // Store tokens if authentication successful
      if (response.success && response.data) {
        this._storeAuthTokens(response.data);
        this._storeUserData(response.data.user, userInfo.picture);
      }

      return {
        success: response.success || false,
        message: response.message || "Google authentication completed",
        data: response.data || null,
      };
    } catch (error) {
      console.error("[AuthController.googleAuth] Error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Google authentication failed. Please try again.",
        data: null,
      };
    }
  }

  /**
   * Logout user — call API (cookie sent automatically), then clear access token and user
   * @returns {Promise<Object>} Logout response
   */
  static async logout() {
    try {
      await postData(`${this.BASE_PATH}/logout`, {});
    } catch (_) {
      // Proceed to clear local state even if API fails (e.g. already expired)
    }
    clearAccessToken();
    localStorage.removeItem("user");
    return {
      success: true,
      message: "Logout successful",
      data: null,
    };
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  static isAuthenticated() {
    const token = getAccessToken();
    const user = localStorage.getItem("user");
    return !!(token && user);
  }

  /**
   * Get current user data from localStorage
   * @returns {Object|null} User data or null
   */
  static getCurrentUser() {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("[AuthController.getCurrentUser] Error:", error);
      return null;
    }
  }

  /**
   * Get access token (from memory; refresh token is in httpOnly cookie)
   * @returns {string|null} Access token or null
   */
  static getAccessToken() {
    return getAccessToken();
  }

  /**
   * Request password reset - sends reset link to email
   * @param {string} email - User's email address
   * @returns {Promise<Object>} Password reset request response
   */
  static async forgotPassword(email) {
    try {
      const payload = {
        email: email.trim(),
      };

      const response = await postData(`${this.BASE_PATH}/request-password-reset`, payload);

      return {
        success: response.success || false,
        message: response.message || "Password reset request processed",
        data: response.data || null,
      };
    } catch (error) {
      console.error("[AuthController.forgotPassword] Error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to process password reset request.",
        data: null,
      };
    }
  }

  /**
   * Reset password with token
   * @param {Object} resetData - Password reset data
   * @param {string} resetData.token - Reset token from email link
   * @param {string} resetData.password - New password
   * @param {string} resetData.confirmPassword - Confirm new password
   * @returns {Promise<Object>} Password reset response
   */
  static async resetPassword(resetData) {
    try {
      // Validate passwords match
      if (resetData.password !== resetData.confirmPassword) {
        return {
          success: false,
          message: "Passwords do not match",
          data: null,
        };
      }

      // Validate password strength (minimum 6 characters)
      if (resetData.password.length < 6) {
        return {
          success: false,
          message: "Password must be at least 6 characters long",
          data: null,
        };
      }

      const payload = {
        token: resetData.token,
        password: resetData.password,
      };

      const response = await postData(`${this.BASE_PATH}/reset-password`, payload);

      return {
        success: response.success || false,
        message: response.message || "Password reset successfully",
        data: response.data || null,
      };
    } catch (error) {
      console.error("[AuthController.resetPassword] Error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Password reset failed. Please try again.",
        data: null,
      };
    }
  }

  // ========== Private Helper Methods ==========

  /**
   * Store access token in memory only (refresh token is in httpOnly cookie).
   * @private
   * @param {Object} data - Response data containing accessToken
   */
  static _storeAuthTokens(data) {
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
    }
  }

  /**
   * Store user data in localStorage
   * @private
   * @param {Object} userData - User data from response
   * @param {string} [googlePicture] - Optional Google profile picture
   */
  static _storeUserData(userData, googlePicture = null) {
    if (!userData) return;

    const user = {
      name: userData.fullName || userData.firstName || "",
      email: userData.email || "",
      userId: userData.id || userData._id || "",
      image: googlePicture || userData.images?.[0] || userData.image || userData.picture || null,
      role: userData.role || "user",
    };

    localStorage.setItem("user", JSON.stringify(user));
  }
}

export default AuthController;
