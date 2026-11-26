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
          await Task.updateOne({ _id: task._id }, {
            $set: { reminderSentAt: new Date() },
            $unset: { reminderClaimedAt: 1 },
          });
          continue;
        }

        let emailSent = Boolean(task.emailReminderSentAt);
        let pushSent = Boolean(task.pushReminderSentAt);
        const dueText = new Date(task.dueDate).toLocaleString();
        const payload = {
          title: 'Task reminder',
          body: task.title + ' is due at ' + dueText,
          url: '/calendar',
          tag: 'task-reminder-' + task._id,
        };

        if (!emailSent) {
          const result = await EmailService.sendTaskReminder(user, task);
          if (!result.success) throw new Error(result.error || 'Reminder email could not be sent');
          emailSent = true;
          await Task.updateOne({ _id: task._id }, { $set: { emailReminderSentAt: new Date() } });
        }

        if (!pushSent && PushService.getPublicKey()) {
          const pushResult = await PushService.sendToUser(user._id, payload);
          if (pushResult.failed > 0) throw new Error('One or more device notifications could not be delivered');
          pushSent = true;
          await Task.updateOne({ _id: task._id }, { $set: { pushReminderSentAt: new Date() } });
        }

        if (emailSent && (pushSent || !PushService.getPublicKey())) {
          await Task.updateOne(
            { _id: task._id },
            { $set: { reminderSentAt: new Date() }, $unset: { reminderClaimedAt: 1 } }
          );
        } else {
          await Task.updateOne({ _id: task._id }, { $unset: { reminderClaimedAt: 1 } });
        }
      } catch (error) {
        console.error('Task reminder delivery failed:', error.message);
        await Task.updateOne(
          { _id: task._id },
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
