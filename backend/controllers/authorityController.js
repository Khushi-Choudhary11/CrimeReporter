const Authority = require('../models/Authority');

// Get all authorities
exports.getAllAuthorities = async (req, res) => {
  try {
    const authorities = await Authority.find();
    res.json(authorities);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Approve authority by ID
exports.approveAuthorityById = async (req, res) => {
  try {
    const { id } = req.params;
    const authority = await Authority.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true }
    );
    if (!authority) return res.status(404).json({ error: 'Authority not found' });
    res.json(authority);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};