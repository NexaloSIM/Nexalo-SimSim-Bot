module.exports = {
  config: {
    name: "teach",
    aliases: ["train", "learn"],
    version: "1.0",
    author: "testing",
    countDown: 5,
    role: 1, // Admin only
    description: "Teaches the bot a new question-answer pair",
    category: "Training",
    guide: "{pn} <question> | <answer>",
    usePrefix: true
  },

  run: async ({ ctx, args, config, userPrefs }) => {
    const Logger = require('../utils/logger');
    const axios = require('axios');

    try {
      const { from, chat } = ctx.message;
      const chatId = chat.id;
      const chatType = chat.type === 'private' ? 'Private' : 'Group';

      if (module.exports.config.usePrefix && !ctx.message.text.startsWith(config.prefix)) {
        return;
      }

      // Check if user is admin
      if (!config.admins.includes(from.id)) {
        await ctx.reply("Only admins can use this command!");
        return;
      }

      // Check if preferences are set
      if (!userPrefs[chatId] || !userPrefs[chatId].language) {
        await ctx.reply('Please set up your preferences using /start.');
        return;
      }

      // Parse arguments
      const text = args.join(' ');
      const [question, answer] = text.split('|').map(part => part.trim());

      if (!question || !answer) {
        await ctx.reply("Please provide both question and answer separated by '|'\nExample: !teach How are you? | I’m great!");
        return;
      }

      const logData = {
        username: from.username,
        uid: from.id,
        message: ctx.message.text,
        type: 'command',
        chatType: chatType
      };

      Logger.info({ ...logData, content: 'Training...' });

      // Prepare API request with user preferences
      const payload = {
        api: config.nexalo.apiKey,
        question: question,
        answer: answer,
        language: userPrefs[chatId].language,
        sentiment: userPrefs[chatId].sentiment || 'neutral',
        category: 'general',
        response_type: 'text',
        image_url: null,
        type: userPrefs[chatId].type || 'good'
      };

      const response = await axios.post(config.nexalo.trainApiUrl, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      const result = response.data;

      if (result.status_code === 201 && result.status === 'Created' && result.data) {
        Logger.info({ ...logData, content: `Trained: ${result.data.message} (ID: ${result.data.id})` });
        await ctx.reply(`Successfully taught!\nQuestion: ${question}\nAnswer: ${answer}\nID: ${result.data.id}\nAPI Calls: ${result.data.api_calls}`);
      } else {
        Logger.error({ ...logData, error: `API error: ${result.message || 'Unknown error'}` });
        await ctx.reply(`Failed to teach: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      Logger.error({
        username: ctx.from.username,
        uid: ctx.from.id,
        message: ctx.message.text,
        type: 'command',
        chatType: ctx.chat.type,
        error: errorMessage
      });
      await ctx.reply(`Error while teaching: ${errorMessage}`);
    }
  }
};
