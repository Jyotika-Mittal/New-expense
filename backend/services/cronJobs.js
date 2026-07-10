const cron = require('node-cron');
const User = require('../models/User');
const Expense = require('../models/Expense');

const generateMonthlyReport = async (userId, month, year) => {
  const expenses = await Expense.find({ user: userId, month, year });
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const categoryBreakdown = {};
  expenses.filter(e => e.type === 'expense').forEach(e => {
    categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
  });
  const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];
  return { totalIncome, totalExpense, balance: totalIncome - totalExpense, topCategory, transactionCount: expenses.length };
};

const startMonthlyReports = () => {
  // Runs on 1st of every month at 9 AM
  cron.schedule('0 9 1 * *', async () => {
    console.log('📊 Running monthly report cron job...');
    try {
      const users = await User.find({});
      const now = new Date();
      const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
      const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      for (const user of users) {
        const report = await generateMonthlyReport(user._id, prevMonth, prevYear);
        console.log(`📩 Monthly report for ${user.email}:`, report);
        // Email sending can be integrated here with nodemailer
      }
    } catch (err) {
      console.error('Cron error:', err.message);
    }
  });

  // Daily alert check at 8 PM
  cron.schedule('0 20 * * *', async () => {
    console.log('🔔 Running daily spending alert check...');
    try {
      const now = new Date();
      const users = await User.find({ monthlyBudget: { $gt: 0 } });
      for (const user of users) {
        const expenses = await Expense.find({
          user: user._id, type: 'expense',
          month: now.getMonth() + 1, year: now.getFullYear()
        });
        const total = expenses.reduce((s, e) => s + e.amount, 0);
        if (total > user.monthlyBudget * 0.9) {
          console.log(`⚠️ Alert for ${user.email}: Spent ${total} of ${user.monthlyBudget} budget`);
        }
      }
    } catch (err) {
      console.error('Daily alert cron error:', err.message);
    }
  });
  console.log('⏰ Cron jobs scheduled');
};

module.exports = { startMonthlyReports, generateMonthlyReport };
