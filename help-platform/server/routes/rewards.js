const express = require('express');
const router = express.Router();
const rewardsController = require('../controllers/rewardsController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', rewardsController.getAllRewards);
router.get('/categories', rewardsController.getRewardCategories);

// Protected routes
router.post('/:rewardId/redeem', authenticate, rewardsController.redeemReward);
router.get('/my-redemptions', authenticate, rewardsController.getUserRedemptions);

module.exports = router;
