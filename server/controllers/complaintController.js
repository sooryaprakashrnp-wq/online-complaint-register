const Complaint = require('../models/Complaint');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Invalid file type'));
  },
}).array('attachments', 5);

// @desc    Create complaint
// @route   POST /api/complaints
// @access  Private (USER)
const createComplaint = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });

    try {
      const { title, description, category, priority } = req.body;

      const attachments = req.files
        ? req.files.map((f) => ({ filename: f.originalname, path: f.path, mimetype: f.mimetype }))
        : [];

      const complaint = await Complaint.create({
        title,
        description,
        category,
        priority: priority || 'MEDIUM',
        createdBy: req.user._id,
        attachments,
      });

      const populated = await complaint.populate('createdBy', 'name email');
      res.status(201).json({ success: true, message: 'Complaint submitted successfully', complaint: populated });
    } catch (error) {
      next(error);
    }
  });
};

// @desc    Get complaints (USER: own | AGENT: assigned | ADMIN: all)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    let query = {};
    const { status, category, priority, page = 1, limit = 10 } = req.query;

    if (req.user.role === 'USER') query.createdBy = req.user._id;
    else if (req.user.role === 'AGENT') query.assignedAgent = req.user._id;

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;
    const total = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email phone')
      .populate('assignedAgent', 'name email')
      .populate('messages.sender', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Access control
    if (
      req.user.role === 'USER' &&
      complaint.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (
      req.user.role === 'AGENT' &&
      complaint.assignedAgent?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint (title/description by USER, status by AGENT/ADMIN)
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = async (req, res, next) => {
  try {
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (req.user.role === 'USER') {
      if (complaint.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      const { title, description } = req.body;
      complaint.title = title || complaint.title;
      complaint.description = description || complaint.description;
    } else {
      // AGENT or ADMIN
      const { status, priority } = req.body;
      if (status) {
        complaint.status = status;
        if (status === 'Resolved') complaint.resolvedAt = new Date();
      }
      if (priority) complaint.priority = priority;
    }

    await complaint.save();
    const updated = await Complaint.findById(complaint._id)
      .populate('createdBy', 'name email')
      .populate('assignedAgent', 'name email');

    res.status(200).json({ success: true, message: 'Complaint updated', complaint: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (ADMIN)
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    await complaint.deleteOne();
    res.status(200).json({ success: true, message: 'Complaint deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add message to complaint (chat)
// @route   POST /api/complaints/:id/message
// @access  Private
const addMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Message text is required' });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.messages.push({
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      text,
    });
    await complaint.save();

    res.status(200).json({ success: true, message: 'Message sent', messages: complaint.messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Add internal note (AGENT/ADMIN only)
// @route   POST /api/complaints/:id/internal-note
// @access  Private (AGENT/ADMIN)
const addInternalNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Note text is required' });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.internalNotes.push({
      author: req.user._id,
      authorName: req.user.name,
      text,
    });
    await complaint.save();

    res.status(200).json({ success: true, message: 'Internal note added', internalNotes: complaint.internalNotes });
  } catch (error) {
    next(error);
  }
};

module.exports = { createComplaint, getComplaints, getComplaint, updateComplaint, deleteComplaint, addMessage, addInternalNote };
