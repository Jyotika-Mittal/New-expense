const mongoose = require('mongoose');
const User = require('./models/User');
const Expense = require('./models/Expense');
const dotenv = require('dotenv');

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const userCount = await User.countDocuments();
    const expenseCount = await Expense.countDocuments();
    console.log('User Count:', userCount);
    console.log('Expense Count:', expenseCount);
    
    if (userCount > 0) {
        const users = await User.find().limit(5);
        console.log('Sample Users:', users.map(u => u.email));
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
