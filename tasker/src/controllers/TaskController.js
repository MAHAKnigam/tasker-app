const TaskService = require('../services/TaskService');
const { validationResult } = require('express-validator');

class TaskController {
  // Create a new task
  async createTask(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Add userId from authenticated user
      const taskData = {
        ...req.body,
        userId: req.userId,
      };

      const result = await TaskService.createTask(taskData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get all tasks for current user
  async getUserTasks(req, res) {
    try {
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        isCompleted: req.query.isCompleted === 'true' ? true : req.query.isCompleted === 'false' ? false : undefined,
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const result = await TaskService.getUserTasks(req.userId, filters);

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

  // Get single task
  async getTaskById(req, res) {
    try {
      const result = await TaskService.getTaskById(req.params.id, req.userId);

      if (!result.success) {
        return res.status(result.error.includes('Not authorized') ? 403 : 404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update task
  async updateTask(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const result = await TaskService.updateTask(req.params.id, req.userId, req.body);

      if (!result.success) {
        return res.status(result.error.includes('Not authorized') ? 403 : 404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete task
  async deleteTask(req, res) {
    try {
      const result = await TaskService.deleteTask(req.params.id, req.userId);

      if (!result.success) {
        return res.status(result.error.includes('Not authorized') ? 403 : 404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Mark task as completed
  async completeTask(req, res) {
    try {
      const result = await TaskService.completeTask(req.params.id, req.userId);

      if (!result.success) {
        return res.status(result.error.includes('Not authorized') ? 403 : 404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get tasks by status
  async getTasksByStatus(req, res) {
    try {
      const result = await TaskService.getTasksByStatus(req.userId, req.params.status);

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

  // Get tasks by priority
  async getTasksByPriority(req, res) {
    try {
      const result = await TaskService.getTasksByPriority(req.userId, req.params.priority);

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
}

module.exports = new TaskController();
