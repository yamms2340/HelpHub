const express = require('express');
const rewardController = require('../controllers/rewards');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/categories', rewardController.getCategories);
router.get('/coins', auth, rewardController.getUserCoins);
router.get('/redemptions', auth, rewardController.getUserRedemptions);
router.get('/', rewardController.getAllRewards);
router.post('/redeem', auth, rewardController.redeemReward);
router.post('/test-add-coins', auth, rewardController.testAddCoins);

module.exports = router;
