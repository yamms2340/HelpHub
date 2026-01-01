const express = require('express');
const campaignController = require('../controllers/campaign');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', campaignController.getAllCampaigns);
router.get('/stats', campaignController.getCampaignStats);
router.get('/:id', campaignController.getCampaignById);
router.post('/', auth, campaignController.createCampaign);
router.post('/:id/donate', auth, campaignController.donateToCampaign);
router.get('/:id/donations', campaignController.getCampaignDonations);
router.put('/:id', auth, campaignController.updateCampaign);
router.delete('/:id', auth, campaignController.deleteCampaign);

module.exports = router;
