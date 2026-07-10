const Goal = require('../models/Goal');
const Expense = require('../models/Expense');

exports.createGoal = async (req, res) => {
  try {
    const goal = await Goal.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addSavings = async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    
    // Update goal
    goal.savedAmount = Math.min(goal.savedAmount + amount, goal.targetAmount);
    if (goal.savedAmount >= goal.targetAmount) goal.status = 'completed';
    await goal.save();

    // Create a corresponding expense entry to reflect the outflow from main balance
    await Expense.create({
      user: req.user._id,
      title: `Saving for ${goal.title}`,
      amount: amount,
      type: 'expense',
      category: 'Investment', // Using Investment as it's a future-focused outflow
      note: `Added savings to goal: ${goal.title}`,
      date: new Date()
    });

    res.json({ success: true, goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
