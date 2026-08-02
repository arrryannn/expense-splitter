const Group = require('../models/Group');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const { calculateGroupBalances } = require('../utils/calculateBalances');

const createGroup = async (req, res) => {
  const { groupName, description, category, memberEmails } = req.body;

  if (!groupName) {
    return res.status(400).json({ message: 'Group name is required' });
  }

  const memberIds = [req.user._id];

  if (memberEmails && Array.isArray(memberEmails)) {
    for (const email of memberEmails) {
      if (email.trim() && email.toLowerCase() !== req.user.email.toLowerCase()) {
        const foundUser = await User.findOne({ email: email.trim().toLowerCase() });
        if (foundUser && !memberIds.includes(foundUser._id.toString())) {
          memberIds.push(foundUser._id);
        }
      }
    }
  }

  const group = await Group.create({
    groupName,
    description: description || '',
    category: category || 'Other',
    members: memberIds,
    createdBy: req.user._id
  });

  const populatedGroup = await Group.findById(group._id)
    .populate('members', 'name email avatar')
    .populate('createdBy', 'name email');

  return res.status(201).json(populatedGroup);
};

const getMyGroups = async (req, res) => {
  const groups = await Group.find({ members: req.user._id })
    .populate('members', 'name email avatar')
    .populate('createdBy', 'name email')
    .sort({ updatedAt: -1 });

  return res.json(groups);
};

const getGroupById = async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('members', 'name email avatar')
    .populate('createdBy', 'name email');

  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const isMember = group.members.some(
    (m) => m._id.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return res.status(403).json({ message: 'Not authorized to view this group' });
  }

  const expenses = await Expense.find({ groupId: group._id })
    .populate('paidBy', 'name email avatar')
    .populate('splitAmong.user', 'name email avatar')
    .sort({ date: -1 });

  const settlements = await Settlement.find({ groupId: group._id })
    .populate('fromUser', 'name email avatar')
    .populate('toUser', 'name email avatar')
    .sort({ date: -1 });

  const balanceData = calculateGroupBalances(group.members, expenses, settlements);

  return res.json({
    group,
    expenses,
    settlements,
    netBalances: balanceData.netBalances,
    suggestedSettlements: balanceData.suggestedSettlements
  });
};

const addMember = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'User email is required' });
  }

  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const userToAdd = await User.findOne({ email: email.trim().toLowerCase() });

  if (!userToAdd) {
    return res.status(404).json({ message: 'No user registered with this email' });
  }

  const alreadyMember = group.members.some(
    (m) => m.toString() === userToAdd._id.toString()
  );

  if (alreadyMember) {
    return res.status(400).json({ message: 'User is already a member of this group' });
  }

  group.members.push(userToAdd._id);
  await group.save();

  const updatedGroup = await Group.findById(group._id).populate('members', 'name email avatar');

  return res.json(updatedGroup);
};

const removeMember = async (req, res) => {
  const { memberId } = req.params;
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  group.members = group.members.filter((m) => m.toString() !== memberId);
  await group.save();

  const updatedGroup = await Group.findById(group._id).populate('members', 'name email avatar');

  return res.json(updatedGroup);
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  addMember,
  removeMember
};