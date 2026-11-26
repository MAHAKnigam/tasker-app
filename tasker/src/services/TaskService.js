const Task = require('../models/Task');
const User = require('../models/User');
const EmailService = require('../utils/EmailService');

class TaskService {
  // Create a new task
  async createTask(taskData) {
    try {
      const task = new Task(taskData);
      await task.save();

      // Send email notification
      try {
        const user = await User.findById(taskData.userId);
        if (user) {
          await EmailService.sendTaskNotification(user, task, 'created');
        }
      } catch (notificationError) {
        // Notification failures must not turn a successful task save into an API failure.
        console.error('Task-created notification failed:', notificationError);
      }

      return {
        success: true,
        data: task,
        message: 'Task created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get all tasks for a user
  async getUserTasks(userId, filters = {}) {
    try {
      const query = { userId };

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.priority) {
        query.priority = filters.priority;
      }
      if (filters.isCompleted !== undefined) {
        query.isCompleted = filters.isCompleted;
      }

      const tasks = await Task.find(query).sort({ createdAt: -1 });

      return {
        success: true,
        data: tasks,
        count: tasks.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get task by ID
  async getTaskById(taskId, userId) {
    try {
      const task = await Task.findById(taskId);

      if (!task) {
        return {
          success: false,
          error: 'Task not found',
        };
      }

      // Check if task belongs to user
      if (task.userId.toString() !== userId) {
        return {
          success: false,
          error: 'Not authorized to view this task',
        };
      }

      return {
        success: true,
        data: task,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Update task
  async updateTask(taskId, userId, updateData) {
    try {
      let task = await Task.findById(taskId);

      if (!task) {
        return {
          success: false,
          error: 'Task not found',
        };
      }

      // Check if task belongs to user
      if (task.userId.toString() !== userId) {
        return {
          success: false,
          error: 'Not authorized to update this task',
        };
      }

      // Only allow editable task fields; never accept ownership or internal fields
      // such as userId, teamId, assignedTo, or comments from the request body.
      const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'tags'];
      const safeUpdates = {};
      for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(updateData, field)) {
          safeUpdates[field] = updateData[field];
        }
      }

      if (Object.keys(safeUpdates).length === 0) {
        return {
          success: false,
          error: 'No valid task fields provided for update',
        };
      }

      if (safeUpdates.status === 'completed') {
        safeUpdates.isCompleted = true;
      } else if (safeUpdates.status && safeUpdates.status !== 'completed') {
        safeUpdates.isCompleted = false;
      }

      task = await Task.findOneAndUpdate(
        { _id: taskId, userId },
        { $set: safeUpdates },
        { new: true, runValidators: true }
      );

      return {
        success: true,
        data: task,
        message: 'Task updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete task
  async deleteTask(taskId, userId) {
    try {
      const task = await Task.findById(taskId);

      if (!task) {
        return {
          success: false,
          error: 'Task not found',
        };
      }

      // Check if task belongs to user
      if (task.userId.toString() !== userId) {
        return {
          success: false,
          error: 'Not authorized to delete this task',
        };
      }

      await Task.findByIdAndDelete(taskId);

      return {
        success: true,
        message: 'Task deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get tasks by status
  async getTasksByStatus(userId, status) {
    try {
      const tasks = await Task.find({ userId, status });

      return {
        success: true,
        data: tasks,
        count: tasks.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Mark task as completed
  async completeTask(taskId, userId) {
    try {
      const task = await Task.findById(taskId);

      if (!task) {
        return {
          success: false,
          error: 'Task not found',
        };
      }

      // Check if task belongs to user
      if (task.userId.toString() !== userId) {
        return {
          success: false,
          error: 'Not authorized to complete this task',
        };
      }

      task.isCompleted = true;
      task.status = 'completed';
      await task.save();

      // Send email notification
      try {
        const user = await User.findById(userId);
        if (user) {
          await EmailService.sendTaskNotification(user, task, 'completed');
        }
      } catch (notificationError) {
        console.error('Task-completed notification failed:', notificationError);
      }

      return {
        success: true,
        data: task,
        message: 'Task marked as completed',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get tasks by priority
  async getTasksByPriority(userId, priority) {
    try {
      const tasks = await Task.find({ userId, priority });

      return {
        success: true,
        data: tasks,
        count: tasks.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new TaskService();
