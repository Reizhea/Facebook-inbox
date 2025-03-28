require('dotenv').config();
const axios = require('axios');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PAGE_ID = '629836296874700';

async function getLastMessages(limit = 3) {
  try {
    const safeLimit = Math.min(Math.max(limit, 1), 5); // Clamp between 1 and 5
    const allMessages = [];

    const convoRes = await axios.get(
      `https://graph.facebook.com/v22.0/${PAGE_ID}/conversations?limit=10&access_token=${PAGE_ACCESS_TOKEN}`
    );

    const conversations = convoRes.data.data || [];

    for (const convo of conversations) {
      const res = await axios.get(
        `https://graph.facebook.com/v22.0/${convo.id}/messages?fields=message,from,created_time&limit=25&access_token=${PAGE_ACCESS_TOKEN}`
      );

      const rawMessages = res.data.data;

      for (const msg of rawMessages) {
        if (
          typeof msg.message === 'string' &&
          msg.message.trim() !== '' &&
          msg.message !== '[No message]'
        ) {
          allMessages.push({
            id: msg.id,
            from: msg.from?.name || 'Unknown',
            userId: msg.from?.id,
            message: msg.message,
            created_time: msg.created_time,
          });
        }
      }
    }

    const sorted = allMessages.sort(
      (a, b) => new Date(b.created_time) - new Date(a.created_time)
    );

    return sorted.slice(0, safeLimit);
  } catch (err) {
    console.error('❌ Facebook API error:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { getLastMessages };
