const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const formatDueDate = (task) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: task.timeZone || 'UTC',
    }).format(new Date(task.dueDate));
  } catch (error) {
    return new Date(task.dueDate).toISOString();
  }
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

class EmailService {
  async sendWelcomeEmail(user) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: 'Welcome to Tasker!',
        html: '<h2>Welcome to Tasker, ' + user.name + '!</h2><p>Your workspace is ready.</p>',
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending welcome email:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendTaskNotification(user, task, action) {
    try {
      const messages = {
        created: ['Task created', 'Your task "' + task.title + '" has been created.'],
        completed: ['Task completed', 'You completed "' + task.title + '".'],
        updated: ['Task updated', 'Your task "' + task.title + '" was updated.'],
        deleted: ['Task deleted', 'Your task "' + task.title + '" was deleted.'],
      };
      if (!messages[action]) return { success: false, error: 'Invalid action' };
      const [subject, message] = messages[action];
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject,
        html: '<div style="font-family:Arial,sans-serif"><h2>' + subject + '</h2><p>Hi ' + user.name + ',</p><p>' + message + '</p></div>',
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending task notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendTaskReminder(user, task) {
    try {
      const dueText = formatDueDate(task);
      const appUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: 'Reminder: ' + task.title + ' is due soon',
        html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h2>Task reminder</h2><p>Hi ' + user.name + ',</p><p><strong>' + task.title + '</strong> is due at ' + dueText + '.</p><p>' + (task.description || '') + '</p><p><a href="' + appUrl + '/calendar">Open your Tasker calendar</a></p></div>',
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending task reminder:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    try {
      const appUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
      const resetLink = appUrl + '/reset-password?token=' + encodeURIComponent(resetToken);
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password reset request',
        html: '<p>Hi ' + user.name + ',</p><p><a href="' + resetLink + '">Reset your password</a></p><p>This link expires in one hour.</p>',
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendDailySummary(user, tasks) {
    try {
      const pendingTasks = tasks.filter((task) => !task.isCompleted);
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: 'Your Tasker daily summary',
        html: '<h2>Daily summary</h2><p>Hi ' + user.name + ', you have ' + pendingTasks.length + ' pending tasks.</p>',
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending daily summary:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testConnection() {
    try {
      await transporter.verify();
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      console.error('Email service configuration error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
