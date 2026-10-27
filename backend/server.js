require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/projects', require('./routes/projects'));

// any unexpected error ends up here, so the server never crashes
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5100;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log('SNAManage backend running on port ' + PORT));
  })
  .catch((err) => console.error('MongoDB connection error:', err.message));
