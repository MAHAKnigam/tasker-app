const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const EmailService = require('../utils/EmailService');
const { getNextDueDate } = require('../utils/recurrence');

class TaskService {
  async createTask(taskData) {
    try {
      // Accept only user-editable fields; ownership and recurrence-series metadata are server-controlled.\n      const data = {\n        title: taskData.title,\n        description: taskData.description,\n        status: taskData.status,\n        priority: taskData.priority,\n        dueDate: taskData.dueDate,\n        recurrence: taskData.recurrence,\n        tags: taskData.tags,\n        userId: taskData.userId,\n      };
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
        reminderMinutesBefore: task.reminderMinutesBefore,
        reminderAt: task.reminderMinutesBefore === null ? null : new Date(new Date(nextDueDate).getTime() - task.reminderMinutesBefore * 60000),
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
      const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'tags', 'reminderMinutesBefore'];
      const safeUpdates = {};
      for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(updateData, field)) safeUpdates[field] = updateData[field];
      }
      if (Object.keys(safeUpdates).length === 0) {
        return { success: false, error: 'No valid task fields provided for update' };
      }
      if (Object.prototype.hasOwnProperty.call(safeUpdates, 'reminderMinutesBefore')) {
        if (![null, 5, 15, 30, 60, 1440].includes(safeUpdates.reminderMinutesBefore)) {
          return { success: false, error: 'Reminder must be disabled or set to a supported interval' };
        }
      }
      if (Object.prototype.hasOwnProperty.call(safeUpdates, 'dueDate') || Object.prototype.hasOwnProperty.call(safeUpdates, 'reminderMinutesBefore')) {
        const dueDate = Object.prototype.hasOwnProperty.call(safeUpdates, 'dueDate') ? safeUpdates.dueDate : undefined;
        const reminderMinutes = Object.prototype.hasOwnProperty.call(safeUpdates, 'reminderMinutesBefore')
          ? safeUpdates.reminderMinutesBefore
          : undefined;
        const existingTask = await Task.findOne({ _id: taskId, userId }).select('dueDate reminderMinutesBefore');
        if (!existingTask) return { success: false, error: 'Task not found or not authorized' };
        const effectiveDueDate = dueDate === undefined ? existingTask.dueDate : dueDate;
        const effectiveReminder = reminderMinutes === undefined ? existingTask.reminderMinutesBefore : reminderMinutes;
        safeUpdates.reminderAt = effectiveDueDate && effectiveReminder !== null
          ? new Date(new Date(effectiveDueDate).getTime() - effectiveReminder * 60000)
          : null;
        safeUpdates.reminderSentAt = null;
        safeUpdates.reminderClaimedAt = null;
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
