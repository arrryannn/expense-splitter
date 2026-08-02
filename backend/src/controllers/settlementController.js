const Settlement = require('../models/Settlement');
const Group = require('../models/Group');

const recordSettlement = async (req, res) => {
  const { groupId, toUser, amount } = req.body;
  const fromUser = req.user._id;

  if (!groupId || !toUser || !amount) {
    return res.status(400).json({ message: 'Please provide all settlement details' });
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: 'Invalid settlement amount' });
  }

  const settlement = await Settlement.create({
    groupId,
    fromUser,
    toUser,
    amount: parsedAmount
  });

  const populatedSettlement = await Settlement.findById(settlement._id)
    .populate('fromUser', 'name email avatar')
    .populate('toUser', 'name email avatar');

  return res.status(201).json(populatedSettlement);
};

const getGroupSettlements = async (req, res) => {
  const { groupId } = req.params;

  const settlements = await Settlement.find({ groupId })
    .populate('fromUser', 'name email avatar')
    .populate('toUser', 'name email avatar')
    .sort({ date: -1 });

  return res.json(settlements);
};

module.exports = {
  recordSettlement,
  getGroupSettlements
};