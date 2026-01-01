let User, Help;
try {
  User = require('../models/User');
  Help = require('../models/Help');
} catch (error) {
  console.warn('⚠️ User/Help models not found, using mock data');
}

const helpService = {
  async getTopHelpers() {
    if (!User) {
      return [
        {
          _id: '1',
          name: 'Dr. Sarah Johnson',
          email: 'sarah@example.com',  
          helpCount: 25,
          rating: 4.8,
          profilePicture: '/images/sarah.jpg'
        },
        {
          _id: '2',
          name: 'Maria Rodriguez',
          email: 'maria@example.com',
          helpCount: 18,
          rating: 4.6,
          profilePicture: '/images/maria.jpg'
        }
      ];
    }

    const topHelpers = await User.find({ helpCount: { $gt: 0 } })
      .select('name email helpCount rating profilePicture')
      .sort({ helpCount: -1, rating: -1 })
      .limit(20);

    return topHelpers;
  },

  async getHelpHistoryByUser(userId) {
    if (!Help) {
      return [
        {
          _id: '1',
          request: {
            _id: 'req1',
            title: 'Emergency Medical Help',
            description: 'Need urgent medical assistance',
            category: 'Healthcare'
          },
          requester: {
            _id: 'user1',
            name: 'John Doe',
            email: 'john@example.com'
          },
          completedAt: new Date()
        }
      ];
    }

    const helpHistory = await Help.find({ helper: userId })
      .populate('request', 'title description category')
      .populate('requester', 'name email')
      .sort({ completedAt: -1 });

    return helpHistory;
  },

  async calculatePlatformStats() {
    if (!User || !Help) {
      return {
        totalHelpers: 42,
        totalHelp: 156,
        averageRating: 4.6,
        thisMonth: {
          newHelpers: 8,
          completedHelp: 23
        },
        categories: {
          healthcare: 45,
          education: 32,
          community: 28,
          emergency: 15
        }
      };
    }

    const totalHelpers = await User.countDocuments({ helpCount: { $gt: 0 } });
    const totalHelp = await Help.countDocuments();
    
    const avgRating = await User.aggregate([
      { $match: { helpCount: { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    
    const monthlyHelpers = await User.countDocuments({ 
      createdAt: { $gte: thisMonth },
      helpCount: { $gt: 0 }
    });
    
    const monthlyHelp = await Help.countDocuments({
      completedAt: { $gte: thisMonth }
    });

    return {
      totalHelpers,
      totalHelp,
      averageRating: avgRating[0]?.avgRating || 0,
      thisMonth: {
        newHelpers: monthlyHelpers,
        completedHelp: monthlyHelp
      }
    };
  },

  async getInspiringStories(limit = 10) {
    const inspiringStories = [
      {
        id: 1,
        title: 'From Struggle to Success',
        author: 'Anonymous Helper',
        story: 'Started helping one person at a time, now impacting hundreds of lives.',
        impact: '200+ people helped',
        category: 'Community',
        date: new Date(),
        likes: 156,
        views: 823
      },
      {
        id: 2,
        title: 'The Power of Small Acts',
        author: 'Maria Rodriguez',
        story: 'Small daily acts of kindness grew into a community movement.',
        impact: '500+ families supported',
        category: 'Community Support',
        date: new Date(),
        likes: 234,
        views: 1205
      }
    ];

    const limitedStories = inspiringStories.slice(0, limit);

    return {
      data: limitedStories,
      count: limitedStories.length,
      total: inspiringStories.length
    };
  }
};

module.exports = helpService;
