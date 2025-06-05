
# Nexalo Telegram Bot

A feature-rich Telegram bot built with Node.js and Telegraf, integrated with the Nexalo SIM API for conversational responses and training capabilities. This bot supports prefix-based commands, admin-only features, and colorful logging with Chalk.

## Features

- **Chat Responses**: Responds to messages without a prefix using the Nexalo SIM API (/v1/chat).
- **Ping Command**: Admin-only command to check latency and user ID (!ping).
- **Teach Command**: Admin-only command to train the SIM API with new question-answer pairs (!teach).
- **Image Support**: Handles image responses from the API when response_type is "image".
- **Colorful Logging**: Uses Chalk v4 for gradient-colored console logs with user details.
- **Role-Based Access**: Restricts certain commands to admins listed in the .env file.

## Prerequisites

- **Node.js**: v20.17.0 or higher
- **npm**: For package management
- **Telegram Bot Token**: Obtain from BotFather
- **Nexalo API Key**: Required for SIM API integration (see below)

## How to Get a Nexalo API Key

To use this project, you need an API key from Nexalo. Follow these steps:

1. **Sign Up**: Visit the Nexalo Dashboard https://nexalo.xyz/dashboard/sign-up. Create an account by filling out the registration form.
2. **Sign In**: After signing up, log in to your Nexalo account.
3. **Create an API Key**: Navigate to the API section (e.g., "Nexalo API" or "Developer Settings"). Click on "Create API" or a similar option. Enter a project name (e.g., "NexaloTelegramBot") and generate the API key. Copy the API key provided (it will look like a unique string, e.g., YOUR_API_KEY).
4. **Use the API Key**: Open your code editor (e.g., VS Code). In the .env file, replace the NEXALO_API_KEY value with your copied API key. Do not share it in chat or public forums.

## Installation

1. **Clone the Repository**
    ```bash
    git clone https://github.com/1dev-hridoy/Nexalo-SimSim-Bot.git
    cd nexalo-telegram-bot
    ```

2. **Install Dependencies**
    ```bash
    npm install
    ```

3. **Set Up Environment Variables**

    Create a `.env` file in the root directory and add the following:

    ```env
    TELEGRAM_TOKEN=your_telegram_bot_token_here
    NEXALO_API_KEY=your_nexalo_api_key_here
    ADMIN_LIST=your_telegram_user_id,your_second_admin_id
    BOT_PREFIX=!
    ```

    - **TELEGRAM_TOKEN**: Get this from BotFather by creating a new bot.
    - **NEXALO_API_KEY**: Your Nexalo API key (see above).
    - **ADMIN_LIST**: Comma-separated Telegram user IDs of admins (e.g., 123456789,987654321).
    - **BOT_PREFIX**: Command prefix (default is !).

    To find your Telegram user ID:

    - Send a message to @userinfobot.
    - Copy the Id field from the response.

4. **Directory Structure**

    ```none
    nexalo-telegram-bot/
    ├── src/
    │   ├── commands/
    │   │   ├── ping.js
    │   │   └── teach.js
    │   ├── config/
    │   │   └── botConfig.js
    │   ├── utils/
    │   │   └── logger.js
    │   └── index.js
    ├── .env
    ├── package.json
    └── README.md
    ```

5. **Start the Bot**

    ```bash
    npm start
    ```

    Or directly:

    ```bash
    node src/index.js
    ```

## Usage

### Commands

- **!ping [user_id]** (Admin-only)
    - Checks bot latency and returns the user ID.
    - Example: `!ping` or `!ping 123456789`
    - Response: `Pong! User ID: 123456789\nLatency: 123ms`
  
- **!teach <question> | <answer>** (Admin-only)
    - Trains the Nexalo SIM API with a new question-answer pair.
    - Example: `!teach ki koro | Boring time, ki korbo?`
    - Response: `Successfully taught!\nQuestion: ki koro\nAnswer: Boring time, ki korbo?\nID: 2`

### Chat Mode

- Send any message without the prefix (e.g., `ki korteco`) to get a response from the Nexalo SIM API.
- If the API returns an image (response_type: "image"), the bot sends the image.

### Logging

- Console logs show user details (username, UID, message type, chat type) with gradient-colored messages.
- Example:
    ```none
    [INFO] 2025-04-06T14:35:00.000Z - User: @testuser UID: 123456789 Type: text Chat: Private Message: ki korteco Response: Chill kori, tu ki koris?
    ```

## Bot Process

1. **Initialization**
    - Loads environment variables from .env.
    - Initializes the Telegraf bot with the Telegram token.
    - Sets up command handlers and SIM API integration.

2. **Command Handling**
    - Loads commands from src/commands/ (e.g., ping.js, teach.js).
    - Registers commands and aliases with Telegraf.
    - Checks for prefix (!) and admin permissions before execution.

3. **Message Processing**
    - Prefixed Messages: Routes to the appropriate command handler.
    - Non-Prefixed Messages: Sends to the Nexalo SIM API (/v1/chat) for a response.
        - Text response: Sent as a message.
        - Image response: Sent as a photo.

4. **Training (Teach Command)**
    - Parses !teach input into question and answer.
    - Sends a POST request to /v1/train with the API key, question, answer, and language.
    - Logs and reports the result (success or error).

5. **Error Handling**
    - Catches API errors (e.g., 401 Unauthorized) and displays specific messages.
    - Logs errors with detailed user and chat information.

6. **Shutdown**
    - Gracefully stops on SIGINT or SIGTERM signals.

## API Integration

- **Chat Endpoint**: `https://sim.api.nexalo.xyz/v1/chat`
    - **Request**: `{ "api": "key", "question": "text", "language": "bn" }`
    - **Response**: Text or image based on response_type

- **Train Endpoint**: `https://sim.api.nexalo.xyz/v1/train`
    - **Request**: `{ "api": "key", "question": "text", "answer": "text", "language": "bn" }`
    - **Response**: `{ "status_code": 201, "data": { "message": "Conversation trained successfully", "id": int } }`

## Troubleshooting

- **"Invalid API key"**:
    - Ensure NEXALO_API_KEY matches a key in your Nexalo api table.
    - Test with Postman: POST `https://sim.api.nexalo.xyz/v1/train` with your key.

- **No Response**:
    - Check if the Nexalo API server is running and accessible.
    - Verify database setup (api and conversations tables).

- **Command Not Working**:
    - Ensure your user ID is in ADMIN_LIST for admin commands.
    - Check the prefix in .env.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Commit changes (`git commit -m "Add new feature"`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For support, contact the developer on GitHub: [@1dev-hridoy](https://github.com/1dev-hridoy). or join discord

