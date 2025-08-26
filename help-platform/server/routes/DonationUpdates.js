const express = require('express');
const router = express.Router();

// Simple auth middleware for development
const authenticateToken = (req, res, next) => {
  req.user = { id: 'test-user-id', name: 'Test User' };
  next();
};

// ✅ FIXED: Remove /api prefix (it's handled by server.js)
router.get('/donation-updates', async (req, res) => {
  try {
    console.log('✅ GET /donation-updates called');
    
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

    res.json({
      success: true,
      data: {
        updates: mockUpdates,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: mockUpdates.length
        }
      }
    });
  } catch (error) {
    console.error('Error in GET /donation-updates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation updates'
    });
  }
});

// ✅ FIXED: POST route without /api prefix
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

    // Mock creation
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

// GET single donation update
router.get('/donation-updates/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log('✅ GET /donation-updates/:id called with ID:', id);
    
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

// PUT: Update donation update
router.put('/donation-updates/:id', authenticateToken, async (req, res) => {
  try {
    const updateId = req.params.id;
    const updateData = req.body;
    
    console.log('✅ PUT /donation-updates/:id called:', { updateId, updateData });

    const updatedData = {
      _id: updateId,
      ...updateData,
      updatedAt: new Date()
    };

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

module.exports = router;
