const express = require('express');
const router = express.Router();
const cacheService = require('../services/cache'); // ✅ ADD CACHE

// Simple auth middleware for development
const authenticateToken = (req, res, next) => {
  req.user = { id: 'test-user-id', name: 'Test User' };
  next();
};

// ==================== GET ALL DONATION UPDATES ====================
router.get('/donation-updates', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status = 'active' } = req.query;
    
    console.log('✅ GET /donation-updates called');

    // ✅ CACHE KEY
    const cacheKey = `donation-updates:${status}:${category || 'all'}:page${page}:limit${limit}`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Donation updates served from cache');
      return res.json({
        success: true,
        data: cached
      });
    }
    
    // Mock data (in production, this would be from database)
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
      },
      {
        _id: '2',
        title: 'Support Education Initiative',
        description: 'Providing books and supplies to underprivileged children.',
        targetAmount: 50000,
        currentAmount: 20000,
        category: 'Education',
        beneficiaryCount: 200,
        urgencyLevel: 'High',
        status: 'active',
        createdAt: new Date()
      }
    ];

    const result = {
      updates: mockUpdates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: 1,
        totalItems: mockUpdates.length,
        limit: parseInt(limit)
      }
    };

    console.log(`✅ Fetched ${mockUpdates.length} donation updates`);

    // ✅ CACHE FOR 5 MINUTES
    await cacheService.set(cacheKey, result, 300);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in GET /donation-updates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation updates'
    });
  }
});

// ==================== CREATE DONATION UPDATE ====================
router.post('/donation-updates', authenticateToken, async (req, res) => {
  try {
    console.log('✅ POST /donation-updates called with data:', req.body);
    
    const {
      title,
      description,
      targetAmount,
      category,
      location,
      contactInfo,
      beneficiaryCount,
      urgencyLevel,
      deadline
    } = req.body;

    // Validation
    if (!title || !description || !targetAmount) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and target amount are required'
      });
    }

    if (Number(targetAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than 0'
      });
    }

    // Mock creation (in production, save to database)
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
      createdBy: req.user.id
    };

    console.log('✅ Successfully created:', newUpdate);

    // ✅ INVALIDATE CACHE
    await cacheService.delPattern('donation-updates:*');
    console.log('🗑️ Donation updates cache invalidated after creation');

    res.status(201).json({
      success: true,
      message: 'Donation update created successfully',
      data: newUpdate
    });
  } catch (error) {
    console.error('Error in POST /donation-updates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create donation update'
    });
  }
});

// ==================== GET SINGLE DONATION UPDATE ====================
router.get('/donation-updates/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log('✅ GET /donation-updates/:id called with ID:', id);

    // ✅ CACHE KEY
    const cacheKey = `donation-update:${id}`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Donation update served from cache:', id);
      return res.json({
        success: true,
        data: cached
      });
    }
    
    // Mock data (in production, fetch from database)
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
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('✅ Donation update fetched:', id);

    // ✅ CACHE FOR 5 MINUTES
    await cacheService.set(cacheKey, update, 300);

    res.json({
      success: true,
      data: update
    });
  } catch (error) {
    console.error('Error in GET /donation-updates/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation update'
    });
  }
});

// ==================== UPDATE DONATION UPDATE ====================
router.put('/donation-updates/:id', authenticateToken, async (req, res) => {
  try {
    const updateId = req.params.id;
    const updateData = req.body;
    
    console.log('✅ PUT /donation-updates/:id called:', { updateId, updateData });

    // Validation
    if (updateData.targetAmount && Number(updateData.targetAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than 0'
      });
    }

    // Mock update (in production, update in database)
    const updatedData = {
      _id: updateId,
      ...updateData,
      updatedAt: new Date()
    };

    console.log('✅ Successfully updated donation update:', updateId);

    // ✅ INVALIDATE CACHES
    await cacheService.del(`donation-update:${updateId}`);
    await cacheService.delPattern('donation-updates:*');
    console.log('🗑️ Donation update caches invalidated after update');

    res.json({
      success: true,
      message: 'Donation update updated successfully',
      data: updatedData
    });
  } catch (error) {
    console.error('Error in PUT /donation-updates/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update donation update'
    });
  }
});

// ==================== DELETE DONATION UPDATE ====================
router.delete('/donation-updates/:id', authenticateToken, async (req, res) => {
  try {
    const updateId = req.params.id;
    
    console.log('✅ DELETE /donation-updates/:id called:', updateId);

    // Mock deletion (in production, delete from database)
    console.log('✅ Successfully deleted donation update:', updateId);

    // ✅ INVALIDATE CACHES
    await cacheService.del(`donation-update:${updateId}`);
    await cacheService.delPattern('donation-updates:*');
    console.log('🗑️ Donation update caches invalidated after deletion');

    res.json({
      success: true,
      message: 'Donation update deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /donation-updates/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete donation update'
    });
  }
});

// ==================== GET STATISTICS ====================
router.get('/donation-updates/stats', async (req, res) => {
  try {
    console.log('✅ GET /donation-updates/stats called');

    // ✅ CACHE KEY
    const cacheKey = 'donation-updates:stats';

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Stats served from cache');
      return res.json({
        success: true,
        data: cached
      });
    }

    // Mock stats (in production, calculate from database)
    const stats = {
      totalUpdates: 25,
      activeUpdates: 18,
      completedUpdates: 7,
      totalTargetAmount: 1500000,
      totalRaisedAmount: 850000,
      totalBeneficiaries: 5000,
      averageCompletion: 56.7
    };

    console.log('✅ Stats calculated');

    // ✅ CACHE FOR 5 MINUTES
    await cacheService.set(cacheKey, stats, 300);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in GET /donation-updates/stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
