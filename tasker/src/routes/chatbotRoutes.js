const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/ChatbotController');
const auth = require('../middleware/auth');

// POST /api/chatbot - Send message to chatbot
router.post('/', auth, chat);

module.exports = router;
