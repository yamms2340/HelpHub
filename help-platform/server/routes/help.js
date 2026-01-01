const express = require('express');
const helpController = require('../controllers/help');

const router = express.Router();

router.get('/hall-of-fame', helpController.getHallOfFame);
router.get('/history/:userId', helpController.getUserHelpHistory);
router.get('/stats', helpController.getPlatformStats);
router.get('/inspiring-stories', helpController.getInspiringStories);

module.exports = router;
