const express = require('express');
const router = express.Router();
const { getMonthlyInsights } = require('../controllers/insightsController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/monthly', getMonthlyInsights);
module.exports = router;
