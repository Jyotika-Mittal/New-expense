const Expense = require('../models/Expense');
const User = require('../models/User');

exports.getMonthlyInsights = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const m = parseInt(month) || currentDate.getMonth() + 1;
    const y = parseInt(year) || currentDate.getFullYear();
    const userId = req.user._id;

    // Current month data
    const expenses = await Expense.find({ user: userId, month: m, year: y });
    const totalIncome = expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const totalExpense = expenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

    // Category breakdown
    const categoryBreakdown = {};
    expenses.filter(e => e.type === 'expense').forEach(e => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    });

    // Previous month
    const prevMonth = m === 1 ? 12 : m - 1;
    const prevYear = m === 1 ? y - 1 : y;
    const prevExpenses = await Expense.find({ user: userId, month: prevMonth, year: prevYear, type: 'expense' });
    const prevCategoryBreakdown = {};
    prevExpenses.forEach(e => {
      prevCategoryBreakdown[e.category] = (prevCategoryBreakdown[e.category] || 0) + e.amount;
    });

    // Generate alerts
    const alerts = [];
    const user = await User.findById(userId);
    if (user.monthlyBudget > 0 && totalExpense > user.monthlyBudget) {
      alerts.push({ type: 'danger', message: `😱 Budget exceeded! You spent ₹${totalExpense.toFixed(0)} vs budget ₹${user.monthlyBudget}` });
    } else if (user.monthlyBudget > 0 && totalExpense > user.monthlyBudget * 0.85) {
      alerts.push({ type: 'warning', message: `⚠️ Almost over budget! ${Math.round((totalExpense / user.monthlyBudget) * 100)}% used` });
    }

    // Overspending alerts by category
    for (const [cat, amount] of Object.entries(categoryBreakdown)) {
      const prev = prevCategoryBreakdown[cat] || 0;
      if (prev > 0 && amount > prev * 1.3) {
        alerts.push({ type: 'warning', message: `😬 You overspent on ${cat}! ₹${amount.toFixed(0)} vs last month ₹${prev.toFixed(0)}` });
      }
      if (cat === 'Food' && amount > 5000) {
        alerts.push({ type: 'info', message: `🍕 Food spending is high at ₹${amount.toFixed(0)} this month` });
      }
    }

    // Daily trend
    const dailyData = {};
    expenses.forEach(e => {
      const day = new Date(e.date).getDate();
      if (!dailyData[day]) dailyData[day] = { income: 0, expense: 0 };
      dailyData[day][e.type] += e.amount;
    });

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1);
      const tm = d.getMonth() + 1;
      const ty = d.getFullYear();
      const mExpenses = await Expense.find({ user: userId, month: tm, year: ty });
      monthlyTrend.push({
        month: d.toLocaleString('default', { month: 'short' }),
        income: mExpenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0),
        expense: mExpenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
      });
    }

    // Overall stats
    const allExpenses = await Expense.find({ user: userId });
    const totalLifetimeIncome = allExpenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const totalLifetimeExpense = allExpenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        savings: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0,
        lifetime: {
          income: totalLifetimeIncome,
          expense: totalLifetimeExpense,
          balance: totalLifetimeIncome - totalLifetimeExpense
        },
        categoryBreakdown,
        alerts,
        dailyData,
        monthlyTrend,
        transactionCount: expenses.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
