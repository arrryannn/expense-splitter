const User = require('../models/User');

const searchUsers = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email query parameter is required' });
  }

  const users = await User.find({
    email: { $regex: email, $options: 'i' }
  }).select('_id name email avatar');

  return res.json(users);
};

const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email ? req.body.email.toLowerCase() : user.email;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  return res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    avatar: updatedUser.avatar
  });
};

module.exports = {
  searchUsers,
  updateProfile
};