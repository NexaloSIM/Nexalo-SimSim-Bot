const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config/botConfig');
const Logger = require('./utils/logger');

// Initialize bot
const bot = new Telegraf(config.telegram.token);

// Command handler
class CommandHandler {
  constructor(bot) {
    this.bot = bot;
    this.commands = new Map();
    this.loadCommands();
  }

  loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath)
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      this.commands.set(command.config.name, command);

      this.bot.command(command.config.name, async (ctx) => {
        await this.handleCommand(command.config.name, ctx);
      });

      if (command.config.aliases) {
        command.config.aliases.forEach(alias => {
          this.commands.set(alias, command);
          this.bot.command(alias, async (ctx) => {
            await this.handleCommand(alias, ctx);
          });
        });
      }

      Logger.info({
        username: 'System',
        uid: 'N/A',
        message: `Loaded command: ${command.config.name}`,
        type: 'system',
        chatType: 'N/A',
        content: 'Command loaded'
      });
    }
  }

  async handleCommand(commandName, ctx) {
    const command = this.commands.get(commandName.toLowerCase());
    if (!command) return;

    try {
      const args = ctx.message.text
        .slice(config.prefix.length + commandName.length)
        .trim()
        .split(/\s+/);

      await command.run({
        ctx,
        args,
        config
      });
    } catch (error) {
      Logger.error({
        username: ctx.from.username,
        uid: ctx.from.id,
        message: ctx.message.text,
        type: 'command',
        chatType: ctx.chat.type,
        error: error.message
      });
      ctx.reply("An error occurred while executing the command.");
    }
  }
}

// SIM API handler
async function handleSimApi(ctx) {
  const question = ctx.message.text;
  const chatType = ctx.chat.type === 'private' ? 'Private' : 'Group';

  const logData = {
    username: ctx.from.username,
    uid: ctx.from.id,
    message: question,
    type: 'text',
    chatType: chatType
  };

  Logger.info({ ...logData, content: 'Processing...' });

  const payload = {
    api: config.nexalo.apiKey,
    question: question,
    language: config.language
  };

  try {
    const response = await axios.post(config.nexalo.simApiUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    const result = response.data;

    if (result.status_code === 200 && result.status === 'OK' && result.data) {
      const { answer, response_type, image_url } = result.data;

      if (response_type === 'image' && image_url) {
        Logger.info({ ...logData, content: `Image URL: ${image_url}` });
        await ctx.replyWithPhoto({ url: image_url });
      } else {
        Logger.info({ ...logData, content: answer });
        await ctx.reply(answer);
      }
    } else {
      Logger.error({ ...logData, error: `API error: ${result.message || 'Unknown error'}` });
      await ctx.reply(`Sorry, I couldn’t get a response: ${result.message || 'Unknown error'}`);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    Logger.error({ ...logData, error: errorMessage });
    await ctx.reply(`Oops! Something went wrong: ${errorMessage}`);
  }
}

// Initialize command handler
const commandHandler = new CommandHandler(bot);

// Handle messages
bot.on('message', async (ctx) => {
  if (!ctx.message.text) return;

  const text = ctx.message.text.trim();
  const isCommand = text.startsWith(config.prefix);

  if (isCommand) {
    const [commandName, ...args] = text.slice(config.prefix.length).split(/\s+/);
    if (commandHandler.commands.has(commandName)) {
      await commandHandler.handleCommand(commandName, ctx);
    }
  } else {
    await handleSimApi(ctx);
  }
});

// Error handling
bot.catch((err, ctx) => {
  Logger.error({
    username: ctx.from?.username || 'Unknown',
    uid: ctx.from?.id || 'N/A',
    message: ctx.message?.text || 'N/A',
    type: ctx.updateType,
    chatType: ctx.chat?.type || 'N/A',
    error: err.message
  });
});

// Start bot
bot.launch()
  .then(() => Logger.info({
    username: 'System',
    uid: 'N/A',
    message: `Bot started with prefix: ${config.prefix}`,
    type: 'system',
    chatType: 'N/A',
    content: 'Startup'
  }))
  .catch(err => Logger.error({
    username: 'System',
    uid: 'N/A',
    message: 'Bot failed to start',
    type: 'system',
    chatType: 'N/A',
    error: err.message
  }));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));