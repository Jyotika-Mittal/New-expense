const mongoose = require('mongoose');
const Expense = require('./models/Expense');
const dotenv = require('dotenv');

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const expenses = await Expense.find();
    console.log('Expenses with dates:');
    expenses.forEach(e => {
        console.log(`Title: ${e.title}, Date: ${e.date}, Month: ${e.month}, Year: ${e.year}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
