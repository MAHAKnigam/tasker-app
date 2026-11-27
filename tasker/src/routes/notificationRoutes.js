const express = require('express');
const authMiddleware = require('../middleware/auth');
const NotificationController = require('../controllers/NotificationController');

const router = express.Router();

router.get('/public-key', (req, res) => NotificationController.getPublicKey(req, res));
router.post('/subscribe', authMiddleware, (req, res) => NotificationController.subscribe(req, res));
router.delete('/subscribe', authMiddleware, (req, res) => NotificationController.unsubscribe(req, res));

module.exports = router;
