const connectDB = require('../../tasker/src/config/database');
const ReminderService = require('../../tasker/src/services/ReminderService');

exports.config = {
  schedule: '*/5 * * * *',
};

exports.handler = async () => {
  try {
    await connectDB();
    await ReminderService.processDueReminders();
    return { statusCode: 200, body: 'Reminder check completed' };
  } catch (error) {
    console.error('Scheduled reminder check failed:', error.message);
    throw error;
  }
};
