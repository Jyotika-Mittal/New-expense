const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/', (req, res) => {
  const categories = [
    { name: 'Food', icon: '🍕', color: '#f97316', type: 'expense' },
    { name: 'Transport', icon: '🚗', color: '#3b82f6', type: 'expense' },
    { name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense' },
    { name: 'Entertainment', icon: '🎬', color: '#8b5cf6', type: 'expense' },
    { name: 'Health', icon: '💊', color: '#10b981', type: 'expense' },
    { name: 'Education', icon: '📚', color: '#06b6d4', type: 'expense' },
    { name: 'Bills', icon: '⚡', color: '#eab308', type: 'expense' },
    { name: 'Housing', icon: '🏠', color: '#6366f1', type: 'expense' },
    { name: 'Travel', icon: '✈️', color: '#14b8a6', type: 'expense' },
    { name: 'Salary', icon: '💰', color: '#22c55e', type: 'income' },
    { name: 'Freelance', icon: '💻', color: '#84cc16', type: 'income' },
    { name: 'Investment', icon: '📈', color: '#a855f7', type: 'income' },
    { name: 'Other', icon: '📦', color: '#94a3b8', type: 'both' },
  ];
  res.json({ success: true, categories });
});
module.exports = router;
