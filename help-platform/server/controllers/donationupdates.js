const donationUpdateService = require('../services/donationupdates');

const donationUpdateController = {
  async getAllUpdates(req, res) {
    try {
      console.log('✅ GET /donation-updates called');
      
      const result = await donationUpdateService.getAllDonationUpdates();
      
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
  },

  async createUpdate(req, res) {
    try {
      console.log('✅ POST /donation-updates called with data:', req.body);
      
      const updateData = {
        ...req.body,
        createdBy: req.user.id
      };
      
      const newUpdate = await donationUpdateService.createDonationUpdate(updateData);
      
      console.log('✅ Successfully created:', newUpdate);
      
      res.status(201).json({
        success: true,
        message: 'Donation update created successfully',
        data: newUpdate
      });
    } catch (error) {
      console.error('Error in POST /donation-updates:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create donation update'
      });
    }
  },

  async getUpdateById(req, res) {
    try {
      const id = req.params.id;
      console.log('✅ GET /donation-updates/:id called with ID:', id);
      
      const update = await donationUpdateService.getDonationUpdateById(id);
      
      res.json({
        success: true,
        data: update
      });
    } catch (error) {
      console.error('Error in GET /donation-updates/:id:', error);
      
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch donation update'
      });
    }
  },

  async updateUpdate(req, res) {
    try {
      const updateId = req.params.id;
      const updateData = req.body;
      
      console.log('✅ PUT /donation-updates/:id called:', { updateId, updateData });
      
      const updatedData = await donationUpdateService.updateDonationUpdate(updateId, updateData);
      
      res.json({
        success: true,
        message: 'Donation update updated successfully',
        data: updatedData
      });
    } catch (error) {
      console.error('Error in PUT /donation-updates/:id:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update donation update'
      });
    }
  }
};

module.exports = donationUpdateController;
