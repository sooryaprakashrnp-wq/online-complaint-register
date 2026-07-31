const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedback, getAllFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('USER'), submitFeedback);
router.get('/', protect, authorize('ADMIN'), getAllFeedback);
router.get('/:complaintId', protect, getFeedback);

module.exports = router;
