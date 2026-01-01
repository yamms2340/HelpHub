const campaignService = require('../services/campaign');

const campaignController = {
  async getAllCampaigns(req, res) {
    try {
      const campaigns = await campaignService.getActiveCampaigns();
      
      res.json({
        success: true,
        data: campaigns
      });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch campaigns'
      });
    }
  },

  async getCampaignStats(req, res) {
    try {
      console.log('📊 Fetching comprehensive campaign statistics...');
      
      const stats = await campaignService.calculateCampaignStats();
      
      console.log('✅ Campaign stats calculated:', stats);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Error fetching campaign stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch campaign statistics',
        error: error.message
      });
    }
  },

  async getCampaignById(req, res) {
    try {
      const campaign = await campaignService.getCampaignById(req.params.id);
      
      res.json({
        success: true,
        data: campaign
      });
    } catch (error) {
      console.error('Error fetching campaign:', error);
      
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch campaign'
      });
    }
  },

  async createCampaign(req, res) {
    try {
      const campaignData = {
        ...req.body,
        creatorId: req.user.id
      };
      
      const campaign = await campaignService.createCampaign(campaignData);
      
      console.log('✅ Campaign created:', campaign._id);
      
      res.status(201).json({
        success: true,
        message: 'Campaign created successfully',
        data: campaign
      });
    } catch (error) {
      console.error('❌ Error creating campaign:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create campaign',
        error: error.message
      });
    }
  },

  async donateToCampaign(req, res) {
    try {
      const donationData = {
        campaignId: req.params.id,
        amount: req.body.amount,
        donorId: req.user.id,
        donorName: req.body.donorName || req.user.name,
        donorEmail: req.body.donorEmail || req.user.email,
        transactionId: req.body.transactionId,
        message: req.body.message
      };
      
      console.log('💰 Adding donation to campaign:', {
        campaignId: donationData.campaignId,
        amount: parseFloat(donationData.amount),
        donor: donationData.donorName
      });
      
      const result = await campaignService.addDonationToCampaign(donationData);
      
      console.log('✅ Donation added successfully:', {
        newAmount: result.campaign.currentAmount,
        percentage: Math.round(result.progressPercentage),
        totalDonors: result.campaign.donors.length
      });
      
      res.json({
        success: true,
        message: 'Donation added successfully',
        data: result
      });
    } catch (error) {
      console.error('❌ Error adding donation:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to add donation',
        error: error.message
      });
    }
  },

  async getCampaignDonations(req, res) {
    try {
      const donations = await campaignService.getCampaignDonations(req.params.id);
      
      res.json({
        success: true,
        data: donations
      });
    } catch (error) {
      console.error('❌ Error fetching donations:', error);
      
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch donations',
        error: error.message
      });
    }
  },

  async updateCampaign(req, res) {
    try {
      const updateData = {
        ...req.body,
        userId: req.user.id
      };
      
      const campaign = await campaignService.updateCampaign(req.params.id, updateData);
      
      res.json({
        success: true,
        message: 'Campaign updated successfully',
        data: campaign
      });
    } catch (error) {
      console.error('❌ Error updating campaign:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update campaign',
        error: error.message
      });
    }
  },

  async deleteCampaign(req, res) {
    try {
      await campaignService.deleteCampaign(req.params.id, req.user.id);
      
      console.log('✅ Campaign deleted:', req.params.id);
      
      res.json({
        success: true,
        message: 'Campaign deleted successfully'
      });
    } catch (error) {
      console.error('❌ Error deleting campaign:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete campaign',
        error: error.message
      });
    }
  }
};

module.exports = campaignController;
