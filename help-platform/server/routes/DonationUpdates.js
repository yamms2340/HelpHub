const express = require('express');
const donationUpdateController = require('../controllers/donationupdates');

const router = express.Router();

// Simple auth middleware for development
const authenticateToken = (req, res, next) => {
  req.user = { id: 'test-user-id', name: 'Test User' };
  next();
};

router.get('/donation-updates', donationUpdateController.getAllUpdates);
router.post('/donation-updates', authenticateToken, donationUpdateController.createUpdate);
router.get('/donation-updates/:id', donationUpdateController.getUpdateById);
router.put('/donation-updates/:id', authenticateToken, donationUpdateController.updateUpdate);

module.exports = router;
