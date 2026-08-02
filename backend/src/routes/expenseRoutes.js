const express = require('express');
const router = express.Router();
const {
  addExpense,
  updateExpense,
  deleteExpense,
  getDashboardSummary
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addExpense);
router.get('/dashboard-summary', getDashboardSummary);
router.route('/:id').put(updateExpense).delete(deleteExpense);

module.exports = router;