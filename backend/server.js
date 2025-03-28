const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const facebookService = require('./services/facebookService');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/messages', async (req, res) => {
    try {
      const limit = req.query.limit || 3;
      const messages = await facebookService.getLastMessages(limit);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error.message);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));