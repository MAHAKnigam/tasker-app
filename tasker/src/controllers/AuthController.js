const AuthenticationService = require('../services/AuthenticationService');
const { validationResult } = require('express-validator');

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const result = await AuthenticationService.register(req.body);
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error('Registration failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Unable to complete registration. Please try again.',
      });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const result = await AuthenticationService.login(req.body);
      if (!result.success) {
        return res.status(401).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Login failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Unable to complete login. Please try again.',
      });
    }
  }

  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { oldPassword, newPassword } = req.body;
      const result = await AuthenticationService.changePassword(
        req.userId,
        oldPassword,
        newPassword
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Password change failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Unable to change password. Please try again.',
      });
    }
  }
}

module.exports = new AuthController();
