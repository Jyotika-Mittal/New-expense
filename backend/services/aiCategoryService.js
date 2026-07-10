// AI-powered category detection based on keywords
const categoryKeywords = {
  Food: ['food', 'restaurant', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger', 'zomato', 'swiggy', 'cafe', 'coffee', 'tea', 'snack', 'grocery', 'vegetables', 'fruit', 'dhaba', 'hotel', 'meal', 'eat', 'biryani', 'chai'],
  Transport: ['uber', 'ola', 'auto', 'bus', 'train', 'flight', 'petrol', 'diesel', 'fuel', 'taxi', 'metro', 'rickshaw', 'cab', 'travel', 'ticket', 'fare', 'parking'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'shop', 'buy', 'cloth', 'shirt', 'shoe', 'dress', 'mall', 'market', 'purchase', 'order', 'delivery', 'meesho'],
  Entertainment: ['netflix', 'hotstar', 'movie', 'cinema', 'game', 'spotify', 'youtube', 'prime', 'show', 'concert', 'event', 'party', 'fun', 'play'],
  Health: ['doctor', 'hospital', 'medicine', 'pharmacy', 'medical', 'clinic', 'health', 'gym', 'fitness', 'yoga', 'lab', 'test', 'tablet', 'injection'],
  Education: ['course', 'book', 'school', 'college', 'university', 'tuition', 'fee', 'study', 'udemy', 'coursera', 'class', 'coaching', 'exam', 'stationery'],
  Bills: ['electricity', 'water', 'internet', 'wifi', 'mobile', 'recharge', 'bill', 'dth', 'gas', 'postpaid', 'prepaid', 'broadband', 'jio', 'airtel'],
  Housing: ['rent', 'house', 'flat', 'apartment', 'maintenance', 'society', 'repair', 'furniture', 'home', 'room'],
  Travel: ['hotel', 'resort', 'trip', 'vacation', 'holiday', 'tour', 'booking', 'makemytrip', 'goibibo', 'airbnb', 'oyo'],
  Salary: ['salary', 'payment received', 'income', 'credited', 'payroll', 'stipend', 'wages'],
  Freelance: ['freelance', 'client', 'project payment', 'consulting', 'gig', 'upwork', 'fiverr', 'contract'],
  Investment: ['investment', 'mutual fund', 'sip', 'stock', 'share', 'crypto', 'bitcoin', 'fd', 'ppf', 'zerodha', 'groww', 'dividend']
};

const detectCategory = (title) => {
  if (!title) return 'Other';
  const lowerTitle = title.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => lowerTitle.includes(kw))) {
      return category;
    }
  }
  return 'Other';
};

module.exports = { detectCategory };
