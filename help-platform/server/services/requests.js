let HelpRequest, User, PointsService;

try {
  HelpRequest = require('../models/HelpRequest');
  User = require('../models/User');
  console.log('✅ HelpRequest and User models loaded');
} catch (error) {
  console.warn('⚠️ HelpRequest/User models not found, using mock mode');
  HelpRequest = null;
  User = null;
}

try {
  PointsService = require('./PointsService');
  console.log('✅ PointsService loaded');
} catch (error) {
  console.warn('⚠️ PointsService not found, using mock implementation');
  PointsService = null;
}

class RequestError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Mock data for fallback
const mockRequests = [
  {
    _id: 'req1',
    title: 'Need help with moving',
    description: 'Looking for help to move furniture',
    category: 'Community',
    urgency: 'Medium',
    location: 'Mumbai',
    status: 'Open',
    requester: {
      _id: 'user1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const requestService = {
  async createHelpRequest(requestData) {
    const { title, description, category, urgency, location, requesterId } = requestData;
    
    // Validation
    if (!title || !description || !category) {
      throw new RequestError('Title, description, and category are required', 400);
    }
    
    if (HelpRequest && User) {
      const newRequest = new HelpRequest({
        title,
        description,
        category,
        urgency: urgency || 'Medium',
        location: location || '',
        requester: requesterId,
        status: 'Open'
      });
      
      const savedRequest = await newRequest.save();
      await savedRequest.populate('requester', 'name email');
      
      // Increment user's requestsCreated counter
      await User.findByIdAndUpdate(requesterId, { 
        $inc: { requestsCreated: 1 } 
      });
      
      return savedRequest;
      
    } else {
      // Mock implementation
      const newRequest = {
        _id: `req_${Date.now()}`,
        title,
        description,
        category,
        urgency: urgency || 'Medium',
        location: location || '',
        status: 'Open',
        requester: {
          _id: requesterId,
          name: 'Mock User',
          email: 'user@example.com'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockRequests.unshift(newRequest);
      return newRequest;
    }
  },

  async offerHelpToRequest(requestId, helperId) {
    if (HelpRequest) {
      const request = await HelpRequest.findById(requestId);
      
      if (!request) {
        throw new RequestError('Request not found', 404);
      }
      
      if (request.status !== 'Open') {
        throw new RequestError('Request is no longer available', 400);
      }
      
      // Check if user is trying to help their own request
      if (request.requester.toString() === helperId) {
        throw new RequestError('You cannot help with your own request', 400);
      }
      
      // Accept helper and change status to "In Progress"
      request.status = 'In Progress';
      request.acceptedBy = helperId;
      request.acceptedAt = new Date();
      
      await request.save();
      await request.populate(['requester', 'acceptedBy'], 'name email');
      
      return request;
      
    } else {
      // Mock implementation
      const request = mockRequests.find(r => r._id === requestId);
      
      if (!request) {
        throw new RequestError('Request not found', 404);
      }
      
      if (request.status !== 'Open') {
        throw new RequestError('Request is no longer available', 400);
      }
      
      if (request.requester._id === helperId) {
        throw new RequestError('You cannot help with your own request', 400);
      }
      
      request.status = 'In Progress';
      request.acceptedBy = {
        _id: helperId,
        name: 'Helper User',
        email: 'helper@example.com'
      };
      request.acceptedAt = new Date();
      
      return request;
    }
  },

  async confirmRequestCompletion(completionData) {
    const { requestId, confirmerId, rating, feedback, completedEarly } = completionData;
    
    if (HelpRequest && User) {
      const request = await HelpRequest.findById(requestId);
      
      if (!request) {
        throw new RequestError('Request not found', 404);
      }
      
      // Only requester can confirm
      if (request.requester.toString() !== confirmerId) {
        throw new RequestError('Only the requester can confirm completion', 403);
      }
      
      if (request.status !== 'In Progress') {
        throw new RequestError('Request is not in progress', 400);
      }
      
      if (!request.acceptedBy) {
        throw new RequestError('No helper assigned to this request', 400);
      }
      
      // Award points using PointsService
      let pointsResult = { points: 50, badges: [], achievements: [] };
      
      if (PointsService && PointsService.awardPoints) {
        pointsResult = await PointsService.awardPoints(
          request.acceptedBy, 
          {
            id: request._id,
            category: request.category,
            urgency: request.urgency
          },
          {
            rating: rating,
            completedEarly: completedEarly
          }
        );
      } else {
        // Mock points calculation
        let points = 50; // Base points
        if (request.urgency === 'High') points += 20;
        if (rating >= 4.5) points += 15;
        if (completedEarly) points += 10;
        pointsResult.points = points;
        
        // Update user points in database if available
        if (User) {
          await User.findByIdAndUpdate(request.acceptedBy, {
            $inc: { 
              totalPoints: points,
              helpCount: 1
            }
          });
        }
      }
      
      // Mark as completed
      request.status = 'Completed';
      request.completedAt = new Date();
      request.rating = rating;
      request.feedback = feedback;
      request.pointsAwarded = pointsResult.points;
      
      await request.save();
      await request.populate(['requester', 'acceptedBy'], 'name email totalPoints');
      
      return {
        request,
        pointsAwarded: pointsResult.points,
        badges: pointsResult.badges || [],
        achievements: pointsResult.achievements || []
      };
      
    } else {
      // Mock implementation
      const request = mockRequests.find(r => r._id === requestId);
      
      if (!request) {
        throw new RequestError('Request not found', 404);
      }
      
      if (request.requester._id !== confirmerId) {
        throw new RequestError('Only the requester can confirm completion', 403);
      }
      
      if (request.status !== 'In Progress') {
        throw new RequestError('Request is not in progress', 400);
      }
      
      // Mock points calculation
      let points = 50;
      if (request.urgency === 'High') points += 20;
      if (rating >= 4.5) points += 15;
      if (completedEarly) points += 10;
      
      request.status = 'Completed';
      request.completedAt = new Date();
      request.rating = rating;
      request.feedback = feedback;
      request.pointsAwarded = points;
      
      return {
        request,
        pointsAwarded: points,
        badges: [],
        achievements: []
      };
    }
  },

  async getAllHelpRequests() {
    if (HelpRequest) {
      const requests = await HelpRequest.find()
        .populate('requester', 'name email')
        .populate('acceptedBy', 'name email totalPoints')
        .sort({ createdAt: -1 });
      
      return requests;
      
    } else {
      // Return mock data sorted by createdAt
      return [...mockRequests].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
  }
};

module.exports = requestService;
