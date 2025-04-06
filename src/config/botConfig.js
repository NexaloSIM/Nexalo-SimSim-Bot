require('dotenv').config();

module.exports = {
  telegram: {
    token: process.env.TELEGRAM_TOKEN
  },
  nexalo: {
    apiKey: process.env.NEXALO_API_KEY,
    simApiUrl: 'https://sim.api.nexalo.xyz/v1/chat',
    trainApiUrl: 'https://sim.api.nexalo.xyz/v1/train' 
  },
  admins: process.env.ADMIN_LIST.split(',').map(id => parseInt(id.trim())),
  prefix: process.env.BOT_PREFIX || '!',
  language: 'bn' // Default language
};