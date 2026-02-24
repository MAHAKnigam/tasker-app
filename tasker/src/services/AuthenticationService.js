const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmailService = require('../utils/EmailService');
const dotenv = require('dotenv');

dotenv.config();

class AuthenticationService {
  // Register a new user
  async register(userData) {
    try {
      const { name, email, password } = userData;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return {
          success: false,
          error: 'User already exists',
        };
      }

      // Create new user
      user = new User({
        name,
        email,
        password,
      });

      await user.save();

      // Send welcome email
      await EmailService.sendWelcomeEmail(user);

      // Generate token
      const token = this.generateToken(user._id);

      return {
        success: true,
        token,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        message: 'User registered successfully. Welcome email sent!',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Login user
  async login(credentials) {
    try {
      const { email, password } = credentials;

      // Validate email & password
      if (!email || !password) {
        return {
          success: false,
          error: 'Please provide email and password',
        };
      }

      // Check for user (include password in the query)
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }

      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }

      // Generate token
      const token = this.generateToken(user._id);

      return {
        success: true,
        token,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        message: 'Login successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Generate JWT token
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }

  // Verify token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return {
        success: true,
        data: decoded,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid token',
      };
    }
  }

  // Change password
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Check old password
      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch) {
        return {
          success: false,
          error: 'Old password is incorrect',
        };
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new AuthenticationService();
