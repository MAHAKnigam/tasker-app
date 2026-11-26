const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const EmailService = require('../utils/EmailService');
const { getNextDueDate } = require('../utils/recurrence');

class TaskService {
  async createTask(taskData) {
    try {
      const data = { ...taskData };
      if (data.recurrence) {
        if (!data.dueDate) {
          return { success: false, error: 'A due date is required for recurring tasks' };
        }
        data.recurrenceSeriesId = new mongoose.Types.ObjectId();
        data.recurrenceIndex = 0;
      }

      const task = new Task(data);
      await task.save();

      try {
        const user = await User.findById(taskData.userId);
        if (user) await EmailService.sendTaskNotification(user, task, 'created');
      } catch (notificationError) {
        console.error('Task-created notification failed:', notificationError);
      }

      return { success: true, data: task, message: 'Task created successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserTasks(userId, filters = {}) {
    try {
      const query = { userId };
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.isCompleted !== undefined) query.isCompleted = filters.isCompleted;
      const tasks = await Task.find(query).sort({ createdAt: -1 });
      return { success: true, data: tasks, count: tasks.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTaskById(taskId, userId) {
    try {
      const task = await Task.findById(taskId);
      if (!task) return { success: false, error: 'Task not found' };
      if (task.userId.toString() !== userId) {
        return { success: false, error: 'Not authorized to view this task' };
      }
      return { success: true, data: task };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createNextOccurrence(task) {
    if (!task.recurrence || !task.recurrenceSeriesId || !task.dueDate) return null;
    const nextDueDate = getNextDueDate(task.dueDate, task.recurrence);
    if (!nextDueDate) return null;

    const nextIndex = (task.recurrenceIndex || 0) + 1;
    try {
      return await Task.create({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: nextDueDate,
        recurrence: task.recurrence,
        recurrenceSeriesId: task.recurrenceSeriesId,
        recurrenceIndex: nextIndex,
        userId: task.userId,
        teamId: task.teamId,
        assignedTo: task.assignedTo,
        tags: task.tags,
      });
    } catch (error) {
      // A unique series/index key makes repeated completion requests idempotent.
      if (error.code === 11000) return null;
      throw error;
    }
  }

  async updateTask(taskId, userId, updateData) {
    try {
      const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'tags'];
      const safeUpdates = {};
      for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(updateData, field)) safeUpdates[field] = updateData[field];
      }
      if (Object.keys(safeUpdates).length === 0) {
        return { success: false, error: 'No valid task fields provided for update' };
      }
      if (safeUpdates.status === 'completed') safeUpdates.isCompleted = true;
      else if (safeUpdates.status && safeUpdates.status !== 'completed') safeUpdates.isCompleted = false;

      const task = await Task.findOneAndUpdate(
        { _id: taskId, userId },
        { $set: safeUpdates },
        { new: true, runValidators: true }
      );
      if (!task) {
        const existing = await Task.findById(taskId);
        if (!existing) return { success: false, error: 'Task not found' };
        return { success: false, error: 'Not authorized to update this task' };
      }

      if (safeUpdates.status === 'completed' && task.recurrence) {
        try {
          await this.createNextOccurrence(task);
        } catch (recurrenceError) {
          console.error('Next recurring task creation failed:', recurrenceError);
        }
      }
      return { success: true, data: task, message: 'Task updated successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteTask(taskId, userId) {
    try {
      const task = await Task.findById(taskId);
      if (!task) return { success: false, error: 'Task not found' };
      if (task.userId.toString() !== userId) {
        return { success: false, error: 'Not authorized to delete this task' };
      }
      await Task.findByIdAndDelete(taskId);
      return { success: true, message: 'Task deleted successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTasksByStatus(userId, status) {
    try {
      const tasks = await Task.find({ userId, status });
      return { success: true, data: tasks, count: tasks.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async completeTask(taskId, userId) {
    try {
      const task = await Task.findOneAndUpdate(
        { _id: taskId, userId, status: { $ne: 'completed' } },
        { $set: { isCompleted: true, status: 'completed' } },
        { new: true, runValidators: true }
      );

      if (!task) {
        const existing = await Task.findById(taskId);
        if (!existing) return { success: false, error: 'Task not found' };
        if (existing.userId.toString() !== userId) {
          return { success: false, error: 'Not authorized to complete this task' };
        }
        return { success: true, data: existing, message: 'Task was already completed' };
      }

      if (task.recurrence) {
        try {
          await this.createNextOccurrence(task);
        } catch (recurrenceError) {
          console.error('Next recurring task creation failed:', recurrenceError);
        }
      }

      try {
        const user = await User.findById(userId);
        if (user) await EmailService.sendTaskNotification(user, task, 'completed');
      } catch (notificationError) {
        console.error('Task-completed notification failed:', notificationError);
      }

      return { success: true, data: task, message: 'Task marked as completed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTasksByPriority(userId, priority) {
    try {
      const tasks = await Task.find({ userId, priority });
      return { success: true, data: tasks, count: tasks.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new TaskService();
