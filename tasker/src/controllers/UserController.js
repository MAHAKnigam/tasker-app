const UserService = require('../services/UserService');
const { validationResult } = require('express-validator');

class UserController {
  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const result = await UserService.getAllUsers();

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get current user profile
  async getCurrentUser(req, res) {
    try {
      const result = await UserService.getUserById(req.userId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const result = await UserService.getUserById(req.params.id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update user profile
  async updateUser(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Users can only update their own profile
      if (req.params.id !== req.userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this user',
        });
      }

      const result = await UserService.updateUser(req.params.id, req.body);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const result = await UserService.deleteUser(req.params.id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new UserController();
