class DonationUpdateError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const donationUpdateService = {
  async getAllDonationUpdates() {
    const mockUpdates = [
      {
        _id: '1',
        title: 'Help Build Community Center',
        description: 'We need funds to construct a new community center.',
        targetAmount: 100000,
        currentAmount: 35000,
        category: 'Community',
        beneficiaryCount: 500,
        urgencyLevel: 'Medium',
        status: 'active',
        createdAt: new Date()
      }
    ];

    return {
      updates: mockUpdates,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: mockUpdates.length
      }
    };
  },

  async createDonationUpdate(updateData) {
    const {
      title,
      description,
      targetAmount,
      category,
      location,
      contactInfo,
      beneficiaryCount,
      urgencyLevel,
      deadline,
      createdBy
    } = updateData;

    if (!title || !description || !targetAmount) {
      throw new DonationUpdateError(
        'Title, description, and target amount are required',
        400
      );
    }

    const newUpdate = {
      _id: Date.now().toString(),
      title,
      description,
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      category: category || 'Community',
      location: location || '',
      contactInfo: contactInfo || {},
      beneficiaryCount: Number(beneficiaryCount) || 1,
      urgencyLevel: urgencyLevel || 'Medium',
      deadline: deadline || new Date().toISOString(),
      status: 'active',
      createdAt: new Date(),
      createdBy: createdBy
    };

    return newUpdate;
  },

  async getDonationUpdateById(id) {
    const update = {
      _id: id,
      title: 'Sample Campaign',
      description: 'Sample description for campaign details.',
      targetAmount: 50000,
      currentAmount: 15000,
      category: 'Community',
      location: 'New Delhi',
      beneficiaryCount: 100,
      urgencyLevel: 'Medium',
      status: 'active',
      deadline: '2025-12-31',
      contactInfo: {
        name: 'Test Contact',
        email: 'test@example.com',
        phone: '+91-9876543210'
      },
      createdAt: new Date()
    };

    return update;
  },

  async updateDonationUpdate(updateId, updateData) {
    const updatedData = {
      _id: updateId,
      ...updateData,
      updatedAt: new Date()
    };

    return updatedData;
  }
};

module.exports = donationUpdateService;
