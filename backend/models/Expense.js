const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['expense', 'income'], required: true },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Bills', 'Housing', 'Travel', 'Salary', 'Freelance', 'Investment', 'Other'],
    required: true
  },
  aiDetected: { type: Boolean, default: false },
  note: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  month: { type: Number },
  year: { type: Number }
}, { timestamps: true });

expenseSchema.pre('save', function (next) {
  const d = new Date(this.date);
  this.month = d.getMonth() + 1;
  this.year = d.getFullYear();
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
