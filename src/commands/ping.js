module.exports = {
    config: {
      name: "ping",
      aliases: ["userinfo", "getuser"],
      version: "1.0",
      author: "testing",
      countDown: 3,
      role: 1,
      description: "Fetches and displays user information based on user ID",
      category: "User",
      guide: "{pn} [user ID]",
      usePrefix: true
    },
  
    run: async ({ ctx, args, config }) => {
      try {
        const { from, chat } = ctx.message;
        
        if (module.exports.config.usePrefix && !ctx.message.text.startsWith(config.prefix)) {
          return;
        }
  
        const userId = args[0] || from.id;
  
        await ctx.reply(
          `Pong! User ID: ${userId}\nLatency: ${Date.now() - ctx.message.date * 1000}ms`,
          { reply_to_message_id: ctx.message.message_id }
        );
  
      } catch (error) {
        await ctx.reply(`Error: ${error.message}`);
      }
    }
  };