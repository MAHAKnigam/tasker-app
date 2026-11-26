const Task = require('../models/Task');
const User = require('../models/User');
const EmailService = require('../utils/EmailService');
const PushService = require('./PushService');

const CLAIM_TIMEOUT_MS = 5 * 60 * 1000;

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
        const dueText = formatDueDate(task);
        const payload = {
          title: 'Task reminder',
          body: task.title + ' is due at ' + dueText,
          url: '/calendar',
          tag: 'task-reminder-' + task._id,
        };

        if (!emailSent) {
          const emailResult = await EmailService.sendTaskReminder(user, task);
          if (emailResult.success) {
            emailSent = true;
            await Task.updateOne({ _id: task._id }, { $set: { emailReminderSentAt: new Date() } });
          } else {
            console.error('Reminder email failed:', emailResult.error || 'Unknown email error');
          }
        }

        if (!pushSent && PushService.getPublicKey()) {
          const pushResult = await PushService.sendToUser(user._id, payload);
          if (pushResult.failed === 0) {
            pushSent = true;
            await Task.updateOne({ _id: task._id }, { $set: { pushReminderSentAt: new Date() } });
          } else {
            console.error('One or more device reminder deliveries failed; they will be retried.');
          }
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
        await Task.updateOne({ _id: task._id }, { $unset: { reminderClaimedAt: 1 } });
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
