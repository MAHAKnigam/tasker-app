const app = require('./app');
const connectDB = require('./config/database');
const dotenv = require('dotenv');
const ReminderService = require('./services/ReminderService');

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    ReminderService.start();
  });
}).catch((error) => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});
