const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private (USER)
const submitFeedback = async (req, res, next) => {
  try {
    const { complaintId, rating, comment } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ success: false, message: 'Feedback can only be given for resolved complaints' });
    }

    if (complaint.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if feedback already submitted
    const existingFeedback = await Feedback.findOne({ complaint: complaintId });
    if (existingFeedback) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted for this complaint' });
    }

    const feedback = await Feedback.create({
      complaint: complaintId,
      user: req.user._id,
      agent: complaint.assignedAgent,
      rating,
      comment,
    });

    // Mark complaint as Closed after feedback
    complaint.status = 'Closed';
    await complaint.save();

    res.status(201).json({ success: true, message: 'Thank you for your feedback!', feedback });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback for a complaint
// @route   GET /api/feedback/:complaintId
// @access  Private
const getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ complaint: req.params.complaintId })
      .populate('user', 'name')
      .populate('agent', 'name');

    if (!feedback) return res.status(404).json({ success: false, message: 'No feedback found' });

    res.status(200).json({ success: true, feedback });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback (admin)
// @route   GET /api/feedback
// @access  Private (ADMIN)
const getAllFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('complaint', 'title category')
      .populate('user', 'name email')
      .populate('agent', 'name')
      .sort({ createdAt: -1 });

    const avgRating = feedbacks.length
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : 0;

    res.status(200).json({ success: true, count: feedbacks.length, avgRating, feedbacks });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitFeedback, getFeedback, getAllFeedback };
