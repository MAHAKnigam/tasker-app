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
      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      const user = new User({
        name,
        email: normalizedEmail,
        password,
      });

      await user.save();

      // Email delivery must not undo a successful account registration.
      let welcomeEmailSent = true;
      try {
        await EmailService.sendWelcomeEmail(user);
      } catch (emailError) {
        welcomeEmailSent = false;
        console.error('Welcome email could not be sent:', emailError);
      }

      const token = this.generateToken(user._id);
      return {
        success: true,
        token,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        message: welcomeEmailSent
          ? 'User registered successfully. Welcome email sent!'
          : 'User registered successfully. Welcome email could not be sent.',
      };
    } catch (error) {
      if (error.code === 11000) {
        return { success: false, error: 'User already exists' };
      }
      console.error('Registration service failed:', error);
      return {
        success: false,
        error: 'Unable to complete registration. Please try again.',
      };
    }
  }

  // Login user
  async login(credentials) {
    try {
      const { email, password } = credentials;
      if (!email || !password) {
        return { success: false, error: 'Please provide email and password' };
      }

      const user = await User.findOne({
        email: email.trim().toLowerCase(),
      }).select('+password');

      if (!user || !(await user.matchPassword(password))) {
        return { success: false, error: 'Invalid credentials' };
      }

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
      console.error('Login service failed:', error);
      return {
        success: false,
        error: 'Unable to complete login. Please try again.',
      };
    }
  }

  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return { success: true, data: decoded };
    } catch (error) {
      return { success: false, error: 'Invalid token' };
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch) {
        return { success: false, error: 'Old password is incorrect' };
      }

      user.password = newPassword;
      await user.save();

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Password change service failed:', error);
      return {
        success: false,
        error: 'Unable to change password. Please try again.',
      };
    }
  }
}

module.exports = new AuthenticationService();
