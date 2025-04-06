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
  
    run: async ({ ctx, args, config }) => {
      const Logger = require('../utils/logger');
  
      try {
        const { from, chat } = ctx.message;
        const chatType = chat.type === 'private' ? 'Private' : 'Group';
  
        if (module.exports.config.usePrefix && !ctx.message.text.startsWith(config.prefix)) {
          return;
        }
  
        // Check if user is admin
        if (!config.admins.includes(from.id)) {
          await ctx.reply("Only admins can use this command!");
          return;
        }
  
        // Parse arguments
        const text = args.join(' ');
        const [question, answer] = text.split('|').map(part => part.trim());
  
        if (!question || !answer) {
          await ctx.reply("Please provide both question and answer separated by '|'\nExample: !teach ki koro | Boring time, ki korbo?");
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
  
        // Prepare API request
        const payload = {
          api: config.nexalo.apiKey,
          question: question,
          answer: answer,
          language: config.language
        };
  
        const axios = require('axios');
        const response = await axios.post(config.nexalo.trainApiUrl, payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        const result = response.data;
  
        if (result.status_code === 201 && result.status === 'Created' && result.data) {
          Logger.info({ ...logData, content: `Trained: ${result.data.message} (ID: ${result.data.id})` });
          await ctx.reply(`Successfully taught!\nQuestion: ${question}\nAnswer: ${answer}\nID: ${result.data.id}`);
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