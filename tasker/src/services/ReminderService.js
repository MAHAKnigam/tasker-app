const Task = require('../models/Task');
const User = require('../models/User');
const EmailService = require('../utils/EmailService');
const PushService = require('./PushService');

const CLAIM_TIMEOUT_MS = 5 * 60 * 1000;

class ReminderService {
  async processDueReminders() {
    const now = new Date();
    const staleClaim = new Date(now.getTime() - CLAIM_TIMEOUT_MS);
    const dueTasks = await Task.find({
      reminderAt: { $lte: now },
      reminderSentAt: null,
      status: { $nin: ['completed', 'cancelled'] },
      $or: [{ reminderClaimedAt: null }, { reminderClaimedAt: { $lt: staleClaim } }],
    }).select('_id').limit(100);

    for (const candidate of dueTasks) {
      const task = await Task.findOneAndUpdate(
        {
          _id: candidate._id,
          reminderAt: { $lte: now },
          reminderSentAt: null,
          status: { $nin: ['completed', 'cancelled'] },
          $or: [{ reminderClaimedAt: null }, { reminderClaimedAt: { $lt: staleClaim } }],
        },
        { $set: { reminderClaimedAt: now } },
        { new: true }
      );
      if (!task) continue;

      try {
        const user = await User.findById(task.userId).select('name email');
        if (!user) {
          await Task.updateOne({ _id: task._id }, { $set: { reminderSentAt: new Date() }, $unset: { reminderClaimedAt: 1 } });
          continue;
        }

        const dueText = new Date(task.dueDate).toLocaleString();
        const payload = {
          title: 'Task reminder',
          body: task.title + ' is due at ' + dueText,
          url: '/calendar',
          tag: 'task-reminder-' + task._id,
        };
        const emailResult = await EmailService.sendTaskReminder(user, task);
        const pushResult = await PushService.sendToUser(user._id, payload);

        // Record the attempt once; a missing push subscription is a supported fallback.
        // Email failures release the claim so the next worker pass can retry.
        if (!emailResult.success) {
          throw new Error(emailResult.error || 'Reminder email could not be sent');
        }
        await Task.updateOne(
          { _id: task._id, reminderClaimedAt: now },
          { $set: { reminderSentAt: new Date() }, $unset: { reminderClaimedAt: 1 } }
        );
        if (pushResult.skipped) {
          console.warn('Push reminders are not configured; email reminder was delivered.');
        }
      } catch (error) {
        console.error('Task reminder delivery failed:', error.message);
        await Task.updateOne(
          { _id: task._id, reminderClaimedAt: now },
          { $unset: { reminderClaimedAt: 1 } }
        );
      }
    }
  }

  start() {
    if (this.timer) return;
    const run = () => this.processDueReminders().catch((error) => console.error('Reminder worker failed:', error));
    run();
    this.timer = setInterval(run, 30000);
    if (this.timer.unref) this.timer.unref();
  }
}

module.exports = new ReminderService();
