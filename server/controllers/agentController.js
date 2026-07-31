const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @desc    Get all agents
// @route   GET /api/agents
// @access  Private (ADMIN)
const getAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: 'AGENT', isActive: true }).select('-password');
    res.status(200).json({ success: true, count: agents.length, agents });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign agent to complaint
// @route   PUT /api/agents/assign
// @access  Private (ADMIN)
const assignAgent = async (req, res, next) => {
  try {
    const { complaintId, agentId } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const agent = await User.findOne({ _id: agentId, role: 'AGENT' });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    complaint.assignedAgent = agentId;
    complaint.status = 'Assigned';
    await complaint.save();

    const updated = await Complaint.findById(complaintId)
      .populate('createdBy', 'name email')
      .populate('assignedAgent', 'name email');

    res.status(200).json({ success: true, message: `Complaint assigned to ${agent.name}`, complaint: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get agent dashboard (assigned complaints summary)
// @route   GET /api/agents/dashboard
// @access  Private (AGENT)
const getAgentDashboard = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ assignedAgent: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const stats = {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === 'Assigned').length,
      inProgress: complaints.filter((c) => c.status === 'In Progress').length,
      resolved: complaints.filter((c) => c.status === 'Resolved').length,
    };

    res.status(200).json({ success: true, stats, complaints });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAgents, assignAgent, getAgentDashboard };
