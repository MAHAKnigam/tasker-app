const ChatbotService = require('../services/ChatbotService');

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const response = await ChatbotService.processMessage(message, userId);

    res.status(200).json({
      success: true,
      response: response
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing your request'
    });
  }
};
