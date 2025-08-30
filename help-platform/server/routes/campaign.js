const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const auth = require('../middleware/auth');

// Get all active campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'active' })
      .populate('creator', 'name email')
      .populate('donors.donor', 'name email')
      .sort({ createdAt: -1 });
    
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

// ✅ NEW: Get campaign statistics for real-time progress (unlimited total)
router.get('/stats', async (req, res) => {
  try {
    const stats = await Campaign.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          totalTargetAmount: { $sum: '$targetAmount' },
          totalCurrentAmount: { $sum: '$currentAmount' },
          totalDonors: { $sum: { $size: '$donors' } },
          // ✅ NEW: Total donated across all campaigns (unlimited)
          totalDonatedAllTime: { $sum: '$currentAmount' }
        }
      }
    ]);

    const campaignStats = stats[0] || {
      totalCampaigns: 0,
      totalTargetAmount: 0,
      totalCurrentAmount: 0,
      totalDonors: 0,
      totalDonatedAllTime: 0
    };

    res.json({
      success: true,
      data: campaignStats
    });
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign statistics'
    });
  }
});

// Get single campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('donors.donor', 'name email');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

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

// Create new campaign
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

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign
    });

  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign'
    });
  }
});

// ✅ NEW: Donate to a specific campaign
router.post('/:id/donate', auth, async (req, res) => {
  try {
    const { amount, donorName, donorEmail, transactionId, message } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid donation amount is required'
      });
    }

    const campaign = await Campaign.findById(req.params.id);
    
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
      campaignId: req.params.id,
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
    
    // ✅ Calculate new percentage
    const progressPercentage = (campaign.currentAmount / campaign.targetAmount) * 100;
    
    // ✅ Mark as completed if target reached
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
      message: 'Failed to add donation'
    });
  }
});

// ✅ NEW: Get campaign donations
router.get('/:id/donations', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
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

    res.json({
      success: true,
      data: {
        campaignTitle: campaign.title,
        donations: sortedDonations,
        totalDonations: sortedDonations.length,
        totalAmount: sortedDonations.reduce((sum, d) => sum + d.amount, 0)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations'
    });
  }
});

// Update campaign
router.put('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
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

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign
    });

  } catch (error) {
    console.error('❌ Error updating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign'
    });
  }
});

// DELETE CAMPAIGN ROUTE
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
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

    await Campaign.findByIdAndDelete(req.params.id);

    console.log('✅ Campaign deleted:', req.params.id);

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign'
    });
  }
});

module.exports = router;
