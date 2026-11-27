const PushService = require('../services/PushService');

class NotificationController {
  getPublicKey(req, res) {
    const publicKey = PushService.getPublicKey();
    if (!publicKey) {
      return res.status(503).json({ success: false, error: 'Device notifications are not configured on this server yet.' });
    }
    return res.status(200).json({ success: true, data: { publicKey } });
  }

  async subscribe(req, res) {
    try {
      await PushService.saveSubscription(req.userId, req.body);
      return res.status(201).json({ success: true, message: 'Device notifications enabled.' });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async unsubscribe(req, res) {
    try {
      const endpoint = req.body?.endpoint;
      if (!endpoint) return res.status(400).json({ success: false, error: 'Subscription endpoint is required.' });
      await PushService.removeSubscription(req.userId, endpoint);
      return res.status(200).json({ success: true, message: 'Device notifications disabled.' });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Could not disable device notifications.' });
    }
  }
}

module.exports = new NotificationController();
