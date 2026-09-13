require('dotenv').config();
const express = require('express');
const cors = require('cors');
const packageRoutes = require('./routes/packages');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 3001;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', packageRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
