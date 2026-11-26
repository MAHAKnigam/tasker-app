require('dotenv').config();

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

  validateSubscription(subscription) {
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      throw new Error('A valid browser push subscription is required');
    }
    let endpoint;
    try {
      endpoint = new URL(subscription.endpoint);
    } catch (error) {
      throw new Error('The push endpoint is invalid');
    }
    const host = endpoint.hostname.toLowerCase();
    const allowedHost = host.endsWith('.push.services.mozilla.com')
      || host.endsWith('.googleapis.com')
      || host.endsWith('.push.apple.com')
      || host.endsWith('.notify.windows.com')
      || host.endsWith('.wns.windows.com');
    if (endpoint.protocol !== 'https:' || !allowedHost) {
      throw new Error('The push endpoint provider is not supported');
    }
  }

  async saveSubscription(userId, subscription) {
    this.validateSubscription(subscription);
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
    if (!configured) return { sent: 0, failed: 0, skipped: true };
    const subscriptions = await PushSubscription.find({ userId });
    let sent = 0;
    let failed = 0;
    for (const item of subscriptions) {
      if (payload.tag && item.lastReminderTag === payload.tag) continue;
      try {
        await webpush.sendNotification(item.subscription, JSON.stringify(payload));
        await PushSubscription.updateOne({ _id: item._id }, { $set: { lastReminderTag: payload.tag || null } });
        sent += 1;
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: item._id });
        } else {
          failed += 1;
          console.error('Push delivery failed:', error.message);
        }
      }
    }
    return { sent, failed, skipped: false };
  }
}

module.exports = new PushService();
