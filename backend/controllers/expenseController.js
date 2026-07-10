const Expense = require('../models/Expense');
const { detectCategory } = require('../services/aiCategoryService');

exports.addExpense = async (req, res) => {
  try {
    const { title, amount, type, category, note, date } = req.body;
    console.log(`📝 Adding ${type}: ${title} - ₹${amount} (Category: ${category})`);
    
    let finalCategory = category;
    let aiDetected = false;
    if (!category || category === 'auto') {
      finalCategory = detectCategory(title);
      aiDetected = true;
      console.log(`🤖 AI Detected Category: ${finalCategory}`);
    }
    const expense = await Expense.create({
      user: req.user._id, title, amount, type, category: finalCategory, aiDetected, note, date: date || new Date()
    });
    console.log(`✅ ${type} saved successfully`);
    res.status(201).json({ success: true, expense });
  } catch (err) {
    console.error(`❌ Error adding expense: ${err.message}`);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const { month, year, type, category, limit = 50, page = 1 } = req.query;
    const filter = { user: req.user._id };
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (type) filter.type = type;
    if (category) filter.category = category;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const expenses = await Expense.find(filter).sort({ date: -1 }).limit(parseInt(limit)).skip(skip);
    const total = await Expense.countDocuments(filter);
    res.json({ success: true, expenses, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.detectCategory = async (req, res) => {
  const { title } = req.body;
  const category = detectCategory(title);
  res.json({ success: true, category });
};
