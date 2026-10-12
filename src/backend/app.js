// backend/app.js
// simple API: /api returns a message, /api/visits counts visits stored in MongoDB
// (this proves all three tiers talk to each other: frontend -> backend -> db)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// MongoDB connection - user/password come from the K8s secret as env vars
const mongoUrl = `mongodb://${process.env.DATABASE_USER}:${encodeURIComponent(process.env.DATABASE_PASSWORD || '')}@${process.env.DATABASE_HOST}:27017/mydatabase?authSource=admin`;
mongoose.connect(mongoUrl)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const Visit = mongoose.model('Visit', new mongoose.Schema({ at: { type: Date, default: Date.now } }));

app.get('/api', (req, res) => {
  res.send('Hello from the Backend!');
});

app.get('/api/visits', async (req, res) => {
  try {
    await Visit.create({});
    const count = await Visit.countDocuments();
    res.json({ visits: count });
  } catch (err) {
    res.status(500).json({ error: 'database not reachable' });
  }
});

// health check for kubernetes / ingress
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
