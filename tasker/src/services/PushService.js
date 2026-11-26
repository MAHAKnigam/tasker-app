const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

const configured = Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
if (configured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:notifications@tasker.local',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

class PushService {
  getPublicKey() {
    return configured ? process.env.VAPID_PUBLIC_KEY : null;
  }

  async saveSubscription(userId, subscription) {
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      throw new Error('A valid browser push subscription is required');
    }
    return PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      { $set: { userId, subscription } },
      { upsert: true, new: true, runValidators: true }
    );
  }

  async removeSubscription(userId, endpoint) {
    return PushSubscription.deleteOne({ userId, endpoint });
  }

  async sendToUser(userId, payload) {
    if (!configured) return { sent: 0, skipped: true };
    const subscriptions = await PushSubscription.find({ userId });
    let sent = 0;
    for (const item of subscriptions) {
      try {
        await webpush.sendNotification(item.subscription, JSON.stringify(payload));
        sent += 1;
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: item._id });
        } else {
          console.error('Push delivery failed:', error.message);
        }
      }
    }
    return { sent, skipped: false };
  }
}

module.exports = new PushService();
