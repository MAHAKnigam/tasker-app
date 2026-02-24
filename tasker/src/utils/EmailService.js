const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Configure email transporter
// For Gmail: Use App Password (not regular password)
// For other providers: Update accordingly
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

class EmailService {
  // Send welcome email
  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Welcome to Tasker! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Tasker, ${user.name}! 👋</h2>
            <p>We're excited to have you on board!</p>
            <p>You can now:</p>
            <ul>
              <li>Create and manage your tasks</li>
              <li>Set priorities and due dates</li>
              <li>Track your progress</li>
              <li>Get instant notifications</li>
            </ul>
            <p><strong>Get Started:</strong> Log in to your dashboard and create your first task!</p>
            <p>Best regards,<br/>The Tasker Team</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending welcome email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send task notification
  async sendTaskNotification(user, task, action) {
    try {
      let subject, message;

      switch (action) {
        case 'created':
          subject = '✅ Task Created';
          message = `Your task "${task.title}" has been created successfully.`;
          break;
        case 'completed':
          subject = '🎉 Task Completed';
          message = `Great job! You've completed task "${task.title}".`;
          break;
        case 'updated':
          subject = '📝 Task Updated';
          message = `Your task "${task.title}" has been updated.`;
          break;
        case 'deleted':
          subject = '🗑️ Task Deleted';
          message = `Task "${task.title}" has been deleted.`;
          break;
        default:
          return { success: false, error: 'Invalid action' };
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${subject}</h2>
            <p>Hi ${user.name},</p>
            <p>${message}</p>
            <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
              <p><strong>Task Details:</strong></p>
              <p><strong>Title:</strong> ${task.title}</p>
              <p><strong>Priority:</strong> ${task.priority}</p>
              <p><strong>Status:</strong> ${task.status}</p>
              ${task.dueDate ? `<p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
            </div>
            <p><a href="http://localhost:3000/dashboard" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Dashboard</a></p>
            <p>Best regards,<br/>The Tasker Team</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Task notification sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending task notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: '🔒 Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>We received a request to reset your password. Click the button below to reset it.</p>
            <p><a href="${resetLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,<br/>The Tasker Team</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send daily summary email
  async sendDailySummary(user, tasks) {
    try {
      const pendingTasks = tasks.filter(t => !t.isCompleted);
      const completedToday = tasks.filter(
        t => t.isCompleted && new Date(t.updatedAt).toDateString() === new Date().toDateString()
      );

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: '📊 Your Daily Task Summary',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your Daily Task Summary 📊</h2>
            <p>Hi ${user.name},</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #e8f5e9; border-radius: 5px;">
              <p><strong>✅ Completed Today:</strong> ${completedToday.length} tasks</p>
              <p><strong>📝 Pending Tasks:</strong> ${pendingTasks.length} tasks</p>
            </div>

            ${pendingTasks.length > 0 ? `
              <h3>Pending Tasks:</h3>
              <ul>
                ${pendingTasks.slice(0, 5).map(task => `
                  <li>
                    <strong>${task.title}</strong> 
                    <span style="color: ${task.priority === 'high' ? '#ff4757' : task.priority === 'medium' ? '#ffa502' : '#2ed573'};">
                      (${task.priority})
                    </span>
                  </li>
                `).join('')}
              </ul>
            ` : `<p>Great job! All tasks completed for today! 🎉</p>`}

            <p><a href="http://localhost:3000/dashboard" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a></p>
            <p>Best regards,<br/>The Tasker Team</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Daily summary sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending daily summary:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Test email configuration
  async testConnection() {
    try {
      await transporter.verify();
      console.log('✅ Email service is properly configured');
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      console.error('❌ Email service configuration error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
