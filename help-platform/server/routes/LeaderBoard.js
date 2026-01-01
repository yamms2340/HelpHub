const express = require('express');
const leaderboardController = require('../controllers/leaderboard');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/stats/overview', leaderboardController.getStatsOverview);
router.get('/user/:userId', leaderboardController.getUserStats);
router.get('/', leaderboardController.getLeaderboard);
router.post('/award-points', auth, leaderboardController.awardPoints);
router.post('/reset-points', auth, leaderboardController.resetPoints);

module.exports = router;
