const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

class CampaignError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const campaignService = {
  async getActiveCampaigns() {
    const campaigns = await Campaign.find({ status: 'active' })
      .populate('creator', 'name email')
      .populate('donors.donor', 'name email')
      .sort({ createdAt: -1 });
    
    return campaigns;
  },

  async calculateCampaignStats() {
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

    const allCompletedDonations = await Donation.find({ status: 'completed' });
    
    const totalDonatedAllTime = allCompletedDonations.reduce(
      (sum, donation) => sum + (donation.amount || 0), 
      0
    );
    
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

    return {
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
  },

  async getCampaignById(campaignId) {
    const campaign = await Campaign.findById(campaignId)
      .populate('creator', 'name email')
      .populate('donors.donor', 'name email');
    
    if (!campaign) {
      throw new CampaignError('Campaign not found', 404);
    }

    return campaign;
  },

  async createCampaign(campaignData) {
    const {
      title,
      description,
      targetAmount,
      category,
      urgency,
      location,
      endDate,
      creatorId
    } = campaignData;

    if (!title || !description || !targetAmount || !category) {
      throw new CampaignError(
        'Title, description, target amount, and category are required',
        400
      );
    }

    if (targetAmount <= 0) {
      throw new CampaignError('Target amount must be greater than 0', 400);
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
      creator: creatorId,
      status: 'active',
      donors: [],
      updates: []
    });

    await campaign.save();
    await campaign.populate('creator', 'name email');

    return campaign;
  },

  async addDonationToCampaign(donationData) {
    const {
      campaignId,
      amount,
      donorId,
      donorName,
      donorEmail,
      transactionId,
      message
    } = donationData;

    if (!amount || amount <= 0) {
      throw new CampaignError('Valid donation amount is required', 400);
    }

    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      throw new CampaignError('Campaign not found', 404);
    }

    if (campaign.status !== 'active') {
      throw new CampaignError('Campaign is not active', 400);
    }

    const newDonation = {
      donor: donorId,
      donorName: donorName,
      donorEmail: donorEmail,
      amount: parseFloat(amount),
      transactionId: transactionId || `txn_${Date.now()}`,
      message: message || '',
      donatedAt: new Date()
    };

    campaign.donors.push(newDonation);
    campaign.currentAmount += parseFloat(amount);
    
    const progressPercentage = (campaign.currentAmount / campaign.targetAmount) * 100;
    
    if (campaign.currentAmount >= campaign.targetAmount) {
      campaign.status = 'completed';
      console.log('🎉 Campaign completed! Target reached:', campaign.title);
    }

    await campaign.save();
    await campaign.populate('creator', 'name email');

    return {
      campaign,
      donation: newDonation,
      newTotal: campaign.currentAmount,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      isCompleted: campaign.status === 'completed'
    };
  },

  async getCampaignDonations(campaignId) {
    const campaign = await Campaign.findById(campaignId)
      .populate('donors.donor', 'name email')
      .select('donors title');
    
    if (!campaign) {
      throw new CampaignError('Campaign not found', 404);
    }

    const sortedDonations = campaign.donors.sort((a, b) => 
      new Date(b.donatedAt) - new Date(a.donatedAt)
    );

    return {
      campaignTitle: campaign.title,
      donations: sortedDonations,
      totalDonations: sortedDonations.length,
      totalAmount: sortedDonations.reduce((sum, d) => sum + d.amount, 0)
    };
  },

  async updateCampaign(campaignId, updateData) {
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      throw new CampaignError('Campaign not found', 404);
    }

    if (campaign.creator.toString() !== updateData.userId) {
      throw new CampaignError('Not authorized to update this campaign', 403);
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
    } = updateData;

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

    return campaign;
  },

  async deleteCampaign(campaignId, userId) {
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      throw new CampaignError('Campaign not found', 404);
    }

    if (campaign.creator.toString() !== userId) {
      throw new CampaignError('Not authorized to delete this campaign', 403);
    }

    if (campaign.currentAmount > 0) {
      throw new CampaignError(
        'Cannot delete campaign that has received donations. You can mark it as completed instead.',
        400
      );
    }

    await Campaign.findByIdAndDelete(campaignId);
  }
};

module.exports = campaignService;
