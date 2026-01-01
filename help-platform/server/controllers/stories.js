const storyService = require('../services/stories');
const fs = require('fs');

const storyController = {
  async getInspiringStories(req, res) {
    try {
      console.log('✅ GET /api/stories/inspiring-stories called');
      
      const limit = parseInt(req.query.limit) || 20;
      const stories = await storyService.getInspiringStories(limit);
      
      res.json({ 
        success: true,
        data: stories,
        count: stories.length,
        message: 'Inspiring stories retrieved successfully'
      });
      
    } catch (error) {
      console.error('❌ Error fetching inspiring stories:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch stories',
        message: error.message
      });
    }
  },

  async getAllStories(req, res) {
    try {
      console.log('✅ GET /api/stories called (hall of fame)');
      
      const stories = await storyService.getAllStories();
      
      res.json({
        success: true,
        data: stories,
        count: stories.length,
        message: 'Hall of Fame entries retrieved successfully'
      });
      
    } catch (error) {
      console.error('❌ Error fetching hall of fame:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch hall of fame entries',
        message: error.message
      });
    }
  },

  async getStats(req, res) {
    try {
      console.log('✅ GET /api/stories/stats called');
      
      const stats = await storyService.getStats();
      
      res.json({
        success: true,
        data: stats,
        message: 'Stats retrieved successfully'
      });
      
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch stats',
        message: error.message
      });
    }
  },

  async submitStory(req, res) {
    try {
      console.log('✅ POST /api/stories/submit called');
      console.log('📝 Request body:', req.body);
      console.log('📁 Uploaded file:', req.file);
      
      const storyData = {
        ...req.body,
        file: req.file
      };
      
      const savedStory = await storyService.submitStory(storyData);
      
      res.status(201).json({
        success: true,
        message: 'Story submitted successfully!',
        data: savedStory
      });
      
    } catch (error) {
      console.error('❌ Error saving story:', error);
      
      // Clean up uploaded file if save fails
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
          console.log('🗑️ Cleaned up uploaded file due to save error');
        } catch (cleanupError) {
          console.error('Failed to cleanup file:', cleanupError);
        }
      }
      
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ 
        success: false,
        error: 'Failed to submit story',
        message: error.message
      });
    }
  },

  async getStoryById(req, res) {
    try {
      const { id } = req.params;
      console.log(`✅ GET /api/stories/${id} called`);
      
      const story = await storyService.getStoryById(id);
      
      res.json({
        success: true,
        data: story,
        message: 'Story retrieved successfully'
      });
      
    } catch (error) {
      console.error('❌ Error fetching story:', error);
      
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to retrieve story',
        error: error.message
      });
    }
  }
};

module.exports = storyController;
