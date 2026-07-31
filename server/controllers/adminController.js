const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');

// @desc    Get system-wide analytics/stats
// @route   GET /api/admin/stats
// @access  Private (ADMIN)
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalAgents, totalComplaints, feedbacks] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: 'AGENT' }),
      Complaint.countDocuments(),
      Feedback.find().select('rating'),
    ]);

    const statusCounts = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const categoryCounts = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const priorityCounts = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Monthly complaints (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const avgRating = feedbacks.length
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAgents,
        totalComplaints,
        avgRating,
        statusCounts,
        categoryCounts,
        priorityCounts,
        monthlyData,
        pendingComplaints: statusCounts.find((s) => s._id === 'Pending')?.count || 0,
        resolvedComplaints: statusCounts.find((s) => s._id === 'Resolved')?.count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (ADMIN)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive } = req.query;
    let filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/admin/users/:id
// @access  Private (ADMIN)
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive, name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive, name, phone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'User updated', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (ADMIN)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'ADMIN') return res.status(400).json({ success: false, message: 'Cannot delete an admin' });
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getAllUsers, updateUser, deleteUser };
