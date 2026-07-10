const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cronJobs = require('./services/cronJobs');

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow any origin in development
    if (process.env.NODE_ENV !== 'production' || !origin) {
      callback(null, true);
    } else {
      const allowed = ['https://new-expense-7kwz.onrender.com'];
      if (allowed.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/categories', require('./routes/categories'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Smart Expense Tracker API running 🚀' }));

// Start cron jobs
cronJobs.startMonthlyReports();

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
