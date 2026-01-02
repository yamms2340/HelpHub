const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');
const cacheService = require('../services/cache'); // ✅ ADD CACHE

// ==================== GET ALL ACTIVE CAMPAIGNS ====================
router.get('/', async (req, res) => {
  try {
    const { status = 'active', category, limit } = req.query;

    // ✅ CREATE CACHE KEY
    const cacheKey = `campaigns:${status}:${category || 'all'}:${limit || 'all'}`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Campaigns served from cache');
      return res.json({
        success: true,
        data: cached
      });
    }

    // Fetch from DB
    const query = { status };
    if (category) query.category = category;

    let campaignsQuery = Campaign.find(query)
      .populate('creator', 'name email')
      .populate('donors.donor', 'name email')
      .sort({ createdAt: -1 });

    if (limit) {
      campaignsQuery = campaignsQuery.limit(parseInt(limit));
    }

    const campaigns = await campaignsQuery;

    console.log(`✅ Fetched ${campaigns.length} campaigns from DB`);

    // ✅ CACHE FOR 5 MINUTES
    await cacheService.set(cacheKey, campaigns, 300);

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
});

// ==================== GET CAMPAIGN STATISTICS ====================
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Fetching comprehensive campaign statistics...');

    // ✅ CACHE KEY
    const cacheKey = 'campaigns:stats';

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Campaign stats served from cache');
      return res.json({
        success: true,
        data: cached
      });
    }

    // Get campaign-specific stats
    const campaignStats = await Campaign.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          totalTargetAmount: { $sum: '$targetAmount' },
          totalCurrentAmount: { $sum: '$currentAmount' },
          totalCampaignDonors: { $sum: { $size: '$donors' } }
        }
      }
    ]);

    // ✅ Get ALL completed donations (campaign + general)
    const allCompletedDonations = await Donation.find({ status: 'completed' });
    
    // Calculate total from ALL donations
    const totalDonatedAllTime = allCompletedDonations.reduce(
      (sum, donation) => sum + (donation.amount || 0), 
      0
    );
    
    // Get unique donor count from all donations
    const uniqueDonorEmails = new Set(
      allCompletedDonations.map(d => d.donorEmail).filter(Boolean)
    );
    const totalUniqueDonors = uniqueDonorEmails.size;

    const stats = campaignStats[0] || {
      totalCampaigns: 0,
      totalTargetAmount: 0,
      totalCurrentAmount: 0,
      totalCampaignDonors: 0
    };

    // ✅ Combine campaign stats with all donation data
    const finalStats = {
      totalCampaigns: stats.totalCampaigns,
      totalTargetAmount: stats.totalTargetAmount,
      totalCurrentAmount: stats.totalCurrentAmount,
      totalDonors: totalUniqueDonors,
      totalDonatedAllTime: totalDonatedAllTime,
      generalDonationsTotal: totalDonatedAllTime - stats.totalCurrentAmount,
      totalDonationCount: allCompletedDonations.length,
      averageDonation: totalUniqueDonors > 0 
        ? Math.round((totalDonatedAllTime / totalUniqueDonors) * 100) / 100 
        : 0
    };

    console.log('✅ Campaign stats calculated:', finalStats);

    // ✅ CACHE FOR 3 MINUTES
    await cacheService.set(cacheKey, finalStats, 180);

    res.json({
      success: true,
      data: finalStats
    });
  } catch (error) {
    console.error('❌ Error fetching campaign stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign statistics',
      error: error.message
    });
  }
});

// ==================== GET SINGLE CAMPAIGN BY ID ====================
router.get('/:id', async (req, res) => {
  try {
    const campaignId = req.params.id;

    // ✅ CACHE KEY
    const cacheKey = `campaign:${campaignId}`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Campaign served from cache:', campaignId);
      return res.json({
        success: true,
        data: cached
      });
    }

    // Fetch from DB
    const campaign = await Campaign.findById(campaignId)
      .populate('creator', 'name email')
      .populate('donors.donor', 'name email');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    console.log('✅ Campaign fetched from DB:', campaignId);

    // ✅ CACHE FOR 5 MINUTES
    await cacheService.set(cacheKey, campaign, 300);

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign'
    });
  }
});

// ==================== CREATE NEW CAMPAIGN ====================
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      targetAmount,
      category,
      urgency,
      location,
      endDate
    } = req.body;

    // Validation
    if (!title || !description || !targetAmount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, target amount, and category are required'
      });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than 0'
      });
    }

    const campaign = new Campaign({
      title: title.trim(),
      description: description.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      category,
      urgency: urgency || 'Medium',
      location: location?.trim() || '',
      endDate: endDate ? new Date(endDate) : null,
      creator: req.user.id,
      status: 'active',
      donors: [],
      updates: []
    });

    await campaign.save();
    await campaign.populate('creator', 'name email');

    console.log('✅ Campaign created:', campaign._id);

    // ✅ INVALIDATE CAMPAIGNS CACHE
    await cacheService.delPattern('campaigns:*');
    console.log('🗑️ Campaigns cache invalidated after creation');

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign
    });

  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message
    });
  }
});

// ==================== DONATE TO CAMPAIGN ====================
router.post('/:id/donate', auth, async (req, res) => {
  try {
    const { amount, donorName, donorEmail, transactionId, message } = req.body;
    const campaignId = req.params.id;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid donation amount is required'
      });
    }

    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Campaign is not active'
      });
    }

    console.log('💰 Adding donation to campaign:', {
      campaignId: campaignId,
      amount: parseFloat(amount),
      donor: donorName || req.user.name
    });

    // Add donation to campaign
    const newDonation = {
      donor: req.user.id,
      donorName: donorName || req.user.name,
      donorEmail: donorEmail || req.user.email,
      amount: parseFloat(amount),
      transactionId: transactionId || `txn_${Date.now()}`,
      message: message || '',
      donatedAt: new Date()
    };

    campaign.donors.push(newDonation);
    campaign.currentAmount += parseFloat(amount);
    
    const progressPercentage = (campaign.currentAmount / campaign.targetAmount) * 100;
    
    // Mark as completed if target reached
    if (campaign.currentAmount >= campaign.targetAmount) {
      campaign.status = 'completed';
      console.log('🎉 Campaign completed! Target reached:', campaign.title);
    }

    await campaign.save();
    await campaign.populate('creator', 'name email');

    console.log('✅ Donation added successfully:', {
      newAmount: campaign.currentAmount,
      percentage: Math.round(progressPercentage),
      totalDonors: campaign.donors.length
    });

    // ✅ INVALIDATE CAMPAIGN CACHES
    await cacheService.del(`campaign:${campaignId}`);
    await cacheService.del(`campaign:${campaignId}:donations`);
    await cacheService.delPattern('campaigns:*');
    console.log('🗑️ Campaign caches invalidated after donation');

    res.json({
      success: true,
      message: 'Donation added successfully',
      data: {
        campaign,
        donation: newDonation,
        newTotal: campaign.currentAmount,
        progressPercentage: Math.round(progressPercentage * 100) / 100,
        isCompleted: campaign.status === 'completed'
      }
    });

  } catch (error) {
    console.error('❌ Error adding donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add donation',
      error: error.message
    });
  }
});

// ==================== GET CAMPAIGN DONATIONS ====================
router.get('/:id/donations', async (req, res) => {
  try {
    const campaignId = req.params.id;

    // ✅ CACHE KEY
    const cacheKey = `campaign:${campaignId}:donations`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Campaign donations served from cache:', campaignId);
      return res.json({
        success: true,
        data: cached
      });
    }

    // Fetch from DB
    const campaign = await Campaign.findById(campaignId)
      .populate('donors.donor', 'name email')
      .select('donors title');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Sort donations by date (newest first)
    const sortedDonations = campaign.donors.sort((a, b) => 
      new Date(b.donatedAt) - new Date(a.donatedAt)
    );

    const donationsData = {
      campaignTitle: campaign.title,
      donations: sortedDonations,
      totalDonations: sortedDonations.length,
      totalAmount: sortedDonations.reduce((sum, d) => sum + d.amount, 0)
    };

    console.log('✅ Campaign donations fetched from DB:', campaignId);

    // ✅ CACHE FOR 5 MINUTES
    await cacheService.set(cacheKey, donationsData, 300);

    res.json({
      success: true,
      data: donationsData
    });

  } catch (error) {
    console.error('❌ Error fetching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations',
      error: error.message
    });
  }
});

// ==================== UPDATE CAMPAIGN ====================
router.put('/:id', auth, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user is the creator or admin
    if (campaign.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this campaign'
      });
    }

    const {
      title,
      description,
      targetAmount,
      category,
      urgency,
      location,
      endDate,
      status
    } = req.body;

    // Update fields
    if (title) campaign.title = title.trim();
    if (description) campaign.description = description.trim();
    if (targetAmount) campaign.targetAmount = parseFloat(targetAmount);
    if (category) campaign.category = category;
    if (urgency) campaign.urgency = urgency;
    if (location !== undefined) campaign.location = location.trim();
    if (endDate !== undefined) campaign.endDate = endDate ? new Date(endDate) : null;
    if (status) campaign.status = status;

    await campaign.save();
    await campaign.populate('creator', 'name email');

    console.log('✅ Campaign updated:', campaignId);

    // ✅ INVALIDATE CAMPAIGN CACHES
    await cacheService.delPattern(`campaign:${campaignId}*`);
    await cacheService.delPattern('campaigns:*');
    console.log('🗑️ Campaign caches invalidated after update');

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign
    });

  } catch (error) {
    console.error('❌ Error updating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign',
      error: error.message
    });
  }
});

// ==================== DELETE CAMPAIGN ====================
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user is the creator or admin
    if (campaign.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this campaign'
      });
    }

    // Check if campaign has donations
    if (campaign.currentAmount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete campaign that has received donations. You can mark it as completed instead.'
      });
    }

    await Campaign.findByIdAndDelete(campaignId);

    console.log('✅ Campaign deleted:', campaignId);

    // ✅ INVALIDATE CAMPAIGN CACHES
    await cacheService.delPattern(`campaign:${campaignId}*`);
    await cacheService.delPattern('campaigns:*');
    console.log('🗑️ Campaign caches invalidated after deletion');

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign',
      error: error.message
    });
  }
});

module.exports = router;
