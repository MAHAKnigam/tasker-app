const Task = require('../models/Task');
const User = require('../models/User');

class ChatbotService {
  static async processMessage(message, userId) {
    const lowerMessage = message.toLowerCase().trim();

    // Show/List tasks
    if (this.matchesIntent(lowerMessage, ['show', 'list', 'get', 'what', 'all tasks'])) {
      return await this.handleShowTasks(userId, lowerMessage);
    }

    // Create task
    if (this.matchesIntent(lowerMessage, ['create', 'add', 'new task', 'make'])) {
      return this.handleCreateTask(message);
    }

    // Get task statistics
    if (this.matchesIntent(lowerMessage, ['stats', 'summary', 'overview', 'how many'])) {
      return await this.handleTaskStats(userId);
    }

    // Complete/Finish task
    if (this.matchesIntent(lowerMessage, ['complete', 'done', 'finish', 'mark complete'])) {
      return this.handleCompleteTask(message);
    }

    // Delete task
    if (this.matchesIntent(lowerMessage, ['delete', 'remove', 'clear'])) {
      return this.handleDeleteTask(message);
    }

    // Help
    if (this.matchesIntent(lowerMessage, ['help', 'what can', 'how do', 'guide', 'commands'])) {
      return this.getHelpMessage();
    }

    // Greeting
    if (this.matchesIntent(lowerMessage, ['hello', 'hi', 'hey', 'greetings'])) {
      const user = await User.findById(userId);
      return `Hello, ${user.name}! 👋 How can I help you with your tasks today?`;
    }

    // Default: Unknown intent
    return this.handleUnknownIntent(message);
  }

  static matchesIntent(message, keywords) {
    return keywords.some(keyword => message.includes(keyword.toLowerCase()));
  }

  static async handleShowTasks(userId, message) {
    try {
      const tasks = await Task.find({ userId });
      
      if (tasks.length === 0) {
        return "You don't have any tasks yet! 🎉 Would you like to create one?";
      }

      // Filter by status if specified
      const pending = tasks.filter(t => !t.isCompleted);
      const completed = tasks.filter(t => t.isCompleted);

      if (message.includes('completed') || message.includes('done')) {
        return this.formatTaskList('Completed Tasks', completed);
      }

      if (message.includes('pending') || message.includes('undone')) {
        return this.formatTaskList('Pending Tasks', pending);
      }

      let response = `📋 You have ${tasks.length} total tasks:\n\n`;
      if (pending.length > 0) {
        response += `⏳ Pending (${pending.length}):\n` + 
                   pending.slice(0, 3).map((t, i) => `  ${i + 1}. ${t.title} (${t.priority})`).join('\n');
      }
      if (completed.length > 0) {
        response += `\n\n✅ Completed (${completed.length}):\n` + 
                   completed.slice(0, 3).map((t, i) => `  ${i + 1}. ${t.title}`).join('\n');
      }
      if (tasks.length > 6) {
        response += `\n\n...and more. View all in the dashboard!`;
      }
      return response;
    } catch (error) {
      return '❌ Error fetching your tasks. Please try again.';
    }
  }

  static formatTaskList(title, tasks) {
    if (tasks.length === 0) {
      return `No ${title.toLowerCase()} at the moment!`;
    }
    let response = `${title} (${tasks.length}):\n`;
    response += tasks.slice(0, 5).map((t, i) => 
      `${i + 1}. ${t.title} - ${t.priority} priority`
    ).join('\n');
    if (tasks.length > 5) {
      response += `\n...and ${tasks.length - 5} more`;
    }
    return response;
  }

  static handleCreateTask(message) {
    // Parse task name from message
    const taskNameMatch = message.match(/(?:create|add|new)?\s*(?:task)?\s*(?:called|named|titled)?\s*['""]?([^'""\n]+)['""]?/i);
    const taskName = taskNameMatch ? taskNameMatch[1].trim() : null;

    if (taskName && taskName.length > 0) {
      return `✅ Got it! I can help you create a task titled "${taskName}". \n\nTo finish creating this task, please:\n1. Click the "+ New Task" button in the dashboard\n2. Enter the title and other details\n3. Submit the form\n\nI'll be here to help!`;
    }

    return '📝 I can help you create a task! Please tell me what task you want to create. For example:\n- "Create a task called Buy groceries"\n- "Add new task: Finish project report"';
  }

  static async handleTaskStats(userId) {
    try {
      const tasks = await Task.find({ userId });
      const pending = tasks.filter(t => !t.isCompleted);
      const completed = tasks.filter(t => t.isCompleted);
      const highPriority = tasks.filter(t => t.priority === 'high' && !t.isCompleted);

      return `📊 Your Task Summary:\n\n` +
             `📌 Total Tasks: ${tasks.length}\n` +
             `⏳ Pending: ${pending.length}\n` +
             `✅ Completed: ${completed.length}\n` +
             `🔴 High Priority: ${highPriority.length}\n\n` +
             `${pending.length > 0 ? `You have ${pending.length} pending task${pending.length !== 1 ? 's' : ''} to complete!` : 'Great! All tasks are complete!'}`;
    } catch (error) {
      return '❌ Error getting task statistics. Please try again.';
    }
  }

  static handleCompleteTask(message) {
    return `To mark a task as complete:\n\n` +
           `1. Find the task in your dashboard\n` +
           `2. Click the "✓ Complete" button\n\n` +
           `Or tell me the task name and I can guide you! 📌`;
  }

  static handleDeleteTask(message) {
    return `To delete a task:\n\n` +
           `1. Find the task in your dashboard\n` +
           `2. Click the "🗑 Delete" button\n` +
           `3. Confirm the deletion\n\n` +
           `Be careful - deleted tasks cannot be recovered! ⚠️`;
  }

  static getHelpMessage() {
    return `🤖 Task Assistant Help\n\n` +
           `I can help you with:\n\n` +
           `📋 Tasks Management:\n` +
           `• "Show my tasks" - List all your tasks\n` +
           `• "Show pending tasks" - View tasks to do\n` +
           `• "Show completed" - View finished tasks\n\n` +
           `➕ Creating Tasks:\n` +
           `• "Create a task called..." - Guide to create tasks\n\n` +
           `📊 Statistics:\n` +
           `• "Show summary" - Task overview\n` +
           `• "How many tasks" - Count your tasks\n\n` +
           `✨ General:\n` +
           `• "Help" - Show this message\n` +
           `• "Hello" - Greet me\n\n` +
           `Need more help? Check your dashboard for full features!`;
  }

  static handleUnknownIntent(message) {
    const responses = [
      `I'm not sure how to help with that. Try asking me to:\n• Show your tasks\n• Create a new task\n• Get a task summary`,
      `I didn't quite understand that. Would you like me to:\n• List your tasks?\n• Help you create a task?\n• Show task statistics?`,
      `Hmm, that's not something I can do directly. But I can:\n• Help you manage tasks\n• Show task statistics\n• Guide you through creating tasks`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

module.exports = ChatbotService;
