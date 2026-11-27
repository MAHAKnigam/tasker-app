const serverless = require('serverless-http');
const app = require('../../tasker/src/app');
const connectDB = require('../../tasker/src/config/database');

const expressHandler = serverless(app);

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectDB();
    return await expressHandler(event, context);
  } catch (error) {
    console.error('Tasker API startup failed:', error.message);
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Service temporarily unavailable' }),
    };
  }
};
