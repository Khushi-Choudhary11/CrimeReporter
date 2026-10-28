const User = require('../models/User');
const Authority = require('../models/Authority');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Block/unblock user
exports.setUserBlocked = async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;
    const user = await User.findByIdAndUpdate(id, { blocked }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Block/unblock authority
exports.setAuthorityBlocked = async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;
    const authority = await Authority.findByIdAndUpdate(id, { blocked }, { new: true });
    if (!authority) return res.status(404).json({ error: 'Authority not found' });
    res.json(authority);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};