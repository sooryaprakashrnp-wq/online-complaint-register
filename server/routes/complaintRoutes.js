const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  addMessage,
  addInternalNote,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getComplaints);
router.post('/', protect, authorize('USER'), createComplaint);
router.get('/:id', protect, getComplaint);
router.put('/:id', protect, updateComplaint);
router.delete('/:id', protect, authorize('ADMIN'), deleteComplaint);
router.post('/:id/message', protect, addMessage);
router.post('/:id/internal-note', protect, authorize('AGENT', 'ADMIN'), addInternalNote);

module.exports = router;
