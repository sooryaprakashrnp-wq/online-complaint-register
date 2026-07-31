const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, updateUser, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('ADMIN'), getStats);
router.get('/users', protect, authorize('ADMIN'), getAllUsers);
router.put('/users/:id', protect, authorize('ADMIN'), updateUser);
router.delete('/users/:id', protect, authorize('ADMIN'), deleteUser);

module.exports = router;
