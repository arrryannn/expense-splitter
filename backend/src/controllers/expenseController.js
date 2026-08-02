const Expense = require('../models/Expense');
const Group = require('../models/Group');
const Settlement = require('../models/Settlement');

const addExpense = async (req, res) => {
  const { groupId, description, amount, category, paidBy, splitType, splitAmong } = req.body;

  if (!groupId || !description || !amount || !paidBy || !splitAmong || splitAmong.length === 0) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const parsedAmount = parseFloat(amount);
  let processedSplitAmong = [];

  if (splitType === 'equal') {
    const share = Math.round((parsedAmount / splitAmong.length) * 100) / 100;
    let remainder = Math.round((parsedAmount - share * splitAmong.length) * 100) / 100;

    processedSplitAmong = splitAmong.map((item, index) => ({
      user: item.user,
      amount: index === 0 ? share + remainder : share,
      percentage: Math.round((100 / splitAmong.length) * 100) / 100
    }));
  } else if (splitType === 'exact') {
    const totalExact = splitAmong.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);
    if (Math.abs(totalExact - parsedAmount) > 0.05) {
      return res.status(400).json({
        message: `Sum of exact splits (${totalExact}) does not match total expense amount (${parsedAmount})`
      });
    }
    processedSplitAmong = splitAmong.map((item) => ({
      user: item.user,
      amount: parseFloat(item.amount),
      percentage: Math.round(((parseFloat(item.amount) / parsedAmount) * 100) * 100) / 100
    }));
  } else if (splitType === 'percentage') {
    const totalPct = splitAmong.reduce((acc, item) => acc + parseFloat(item.percentage || 0), 0);
    if (Math.abs(totalPct - 100) > 0.5) {
      return res.status(400).json({
        message: `Sum of percentages (${totalPct}%) must equal 100%`
      });
    }
    processedSplitAmong = splitAmong.map((item) => {
      const pct = parseFloat(item.percentage);
      return {
        user: item.user,
        percentage: pct,
        amount: Math.round(((parsedAmount * pct) / 100) * 100) / 100
      };
    });
  }

  const expense = await Expense.create({
    groupId,
    description,
    amount: parsedAmount,
    category: category || 'Other',
    paidBy,
    splitType: splitType || 'equal',
    splitAmong: processedSplitAmong
  });

  const populatedExpense = await Expense.findById(expense._id)
    .populate('paidBy', 'name email avatar')
    .populate('splitAmong.user', 'name email avatar');

  return res.status(201).json(populatedExpense);
};

const updateExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  const { description, amount, category, paidBy, splitType, splitAmong } = req.body;

  expense.description = description || expense.description;
  expense.category = category || expense.category;
  expense.paidBy = paidBy || expense.paidBy;
  expense.splitType = splitType || expense.splitType;

  if (amount) {
    expense.amount = parseFloat(amount);
  }

  if (splitAmong && Array.isArray(splitAmong)) {
    const parsedAmount = expense.amount;
    let processedSplitAmong = [];

    if (expense.splitType === 'equal') {
      const share = Math.round((parsedAmount / splitAmong.length) * 100) / 100;
      let remainder = Math.round((parsedAmount - share * splitAmong.length) * 100) / 100;

      processedSplitAmong = splitAmong.map((item, index) => ({
        user: item.user,
        amount: index === 0 ? share + remainder : share,
        percentage: Math.round((100 / splitAmong.length) * 100) / 100
      }));
    } else if (expense.splitType === 'exact') {
      processedSplitAmong = splitAmong.map((item) => ({
        user: item.user,
        amount: parseFloat(item.amount),
        percentage: Math.round(((parseFloat(item.amount) / parsedAmount) * 100) * 100) / 100
      }));
    } else if (expense.splitType === 'percentage') {
      processedSplitAmong = splitAmong.map((item) => {
        const pct = parseFloat(item.percentage);
        return {
          user: item.user,
          percentage: pct,
          amount: Math.round(((parsedAmount * pct) / 100) * 100) / 100
        };
      });
    }
    expense.splitAmong = processedSplitAmong;
  }

  await expense.save();

  const updatedExpense = await Expense.findById(expense._id)
    .populate('paidBy', 'name email avatar')
    .populate('splitAmong.user', 'name email avatar');

  return res.json(updatedExpense);
};

const deleteExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  await expense.deleteOne();

  return res.json({ message: 'Expense removed successfully' });
};

const getDashboardSummary = async (req, res) => {
  const userId = req.user._id;

  const groups = await Group.find({ members: userId }).select('_id groupName category members');
  const groupIds = groups.map((g) => g._id);

  const expenses = await Expense.find({ groupId: { $in: groupIds } })
    .populate('paidBy', 'name email avatar')
    .populate('groupId', 'groupName')
    .sort({ date: -1 });

  const settlements = await Settlement.find({ groupId: { $in: groupIds } })
    .populate('fromUser', 'name email avatar')
    .populate('toUser', 'name email avatar');

  let totalUserExpenses = 0;
  let youOwe = 0;
  let youAreOwed = 0;

  expenses.forEach((exp) => {
    const isPayer = exp.paidBy._id.toString() === userId.toString();
    const userSplit = exp.splitAmong.find((s) => s.user.toString() === userId.toString());

    if (isPayer) {
      totalUserExpenses += exp.amount;
      const othersShare = exp.splitAmong
        .filter((s) => s.user.toString() !== userId.toString())
        .reduce((sum, s) => sum + s.amount, 0);
      youAreOwed += othersShare;
    } else if (userSplit) {
      youOwe += userSplit.amount;
    }
  });

  settlements.forEach((s) => {
    if (s.fromUser._id.toString() === userId.toString()) {
      youOwe -= s.amount;
    }
    if (s.toUser._id.toString() === userId.toString()) {
      youAreOwed -= s.amount;
    }
  });

  return res.json({
    totalUserExpenses: Math.round(totalUserExpenses * 100) / 100,
    youOwe: Math.max(0, Math.round(youOwe * 100) / 100),
    youAreOwed: Math.max(0, Math.round(youAreOwed * 100) / 100),
    totalGroups: groups.length,
    recentExpenses: expenses.slice(0, 5)
  });
};

module.exports = {
  addExpense,
  updateExpense,
  deleteExpense,
  getDashboardSummary
};