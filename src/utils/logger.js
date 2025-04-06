const chalk = require('chalk');

class Logger {
  static gradient(text) {
    return chalk.hex('#FF6B6B')(text.slice(0, text.length / 3)) +
           chalk.hex('#4ECDC4')(text.slice(text.length / 3, 2 * text.length / 3)) +
           chalk.hex('#45B7D1')(text.slice(2 * text.length / 3));
  }

  static info({ username, uid, message, type, chatType, content }) {
    const logMessage = `[INFO] ${new Date().toISOString()} - ` +
      `User: ${chalk.cyan(username || 'Unknown')} ` +
      `UID: ${chalk.yellow(uid)} ` +
      `Type: ${chalk.green(type)} ` +
      `Chat: ${chalk.magenta(chatType)} ` +
      `Message: ${this.gradient(message)} ` +
      `Response: ${chalk.gray(content)}`;
    console.log(logMessage);
  }

  static error({ username, uid, message, type, chatType, error }) {
    const logMessage = `[ERROR] ${new Date().toISOString()} - ` +
      `User: ${chalk.cyan(username || 'Unknown')} ` +
      `UID: ${chalk.yellow(uid)} ` +
      `Type: ${chalk.green(type)} ` +
      `Chat: ${chalk.magenta(chatType)} ` +
      `Message: ${this.gradient(message)} ` +
      `Error: ${chalk.red(error)}`;
    console.error(logMessage);
  }
}

module.exports = Logger;