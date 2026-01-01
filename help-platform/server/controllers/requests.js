const requestService = require('../services/requests');

const requestController = {
  async createRequest(req, res) {
    try {
      const { title, description, category, urgency, location } = req.body;
      
      const savedRequest = await requestService.createHelpRequest({
        title,
        description,
        category,
        urgency,
        location,
        requesterId: req.user.id
      });
      
      res.status(201).json(savedRequest);
    } catch (error) {
      console.error('Create request error:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({ 
          message: error.message 
        });
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  },

  async offerHelp(req, res) {
    try {
      const requestId = req.params.id;
      const helperId = req.user.id;
      
      const updatedRequest = await requestService.offerHelpToRequest(
        requestId, 
        helperId
      );
      
      res.json(updatedRequest);
    } catch (error) {
      console.error('Offer help error:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({ 
          message: error.message 
        });
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  },

  async confirmCompletion(req, res) {
    try {
      const requestId = req.params.id;
      const { rating, feedback, completedEarly } = req.body;
      
      const result = await requestService.confirmRequestCompletion({
        requestId,
        confirmerId: req.user.id,
        rating: rating || 5,
        feedback: feedback || '',
        completedEarly: completedEarly || false
      });
      
      res.json({ 
        message: 'Request completed and points awarded!',
        request: result.request,
        points: result.pointsAwarded,
        badges: result.badges,
        achievements: result.achievements
      });
      
    } catch (error) {
      console.error('Confirm completion error:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({ 
          message: error.message 
        });
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getAllRequests(req, res) {
    try {
      const requests = await requestService.getAllHelpRequests();
      res.json(requests);
    } catch (error) {
      console.error('Get requests error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = requestController;
