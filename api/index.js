const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('../server/config/db');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure Database Connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database Connection Error', error: err.message });
  }
});

// API Routes
app.use('/api/auth', require('../server/routes/authRoutes'));
app.use('/api/complaints', require('../server/routes/complaintRoutes'));
app.use('/api/agents', require('../server/routes/agentRoutes'));
app.use('/api/feedback', require('../server/routes/feedbackRoutes'));
app.use('/api/admin', require('../server/routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🚀 Complaint System API is running on Vercel Serverless' });
});

// Root fallback for API
app.use((req, res) => {
  res.status(404).json({ success: false, message: `API route ${req.originalUrl} not found` });
});

module.exports = app;

