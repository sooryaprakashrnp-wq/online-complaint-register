const express = require('express');
const router = express.Router();
const { getAgents, assignAgent, getAgentDashboard } = require('../controllers/agentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('ADMIN'), getAgents);
router.put('/assign', protect, authorize('ADMIN'), assignAgent);
router.get('/dashboard', protect, authorize('AGENT'), getAgentDashboard);

module.exports = router;
