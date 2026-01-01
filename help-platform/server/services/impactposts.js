const cacheService = require('./cache');

let ImpactPost;
try {
  ImpactPost = require('../models/ImpactPost');
  console.log('✅ ImpactPost model loaded successfully from:', require.resolve('../models/ImpactPost'));
} catch (error) {
  console.error('❌ Failed to load ImpactPost model:', error.message);
  console.log('⚠️ Falling back to mock mode');
  ImpactPost = null;
}

class ImpactPostError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

const mockPosts = [
  {
    _id: '66d1234567890abcdef12345',
    title: 'Emergency Medical Support for Families',
    category: 'Healthcare',
    beneficiaries: 45,
    amount: 25000,
    details: 'Provided emergency medical assistance including ambulance services, medicines, and hospital fees for families who could not afford treatment during the monsoon season.',
    authorName: 'Dr. Sarah Johnson',
    authorId: null,
    isVerified: true,
    likes: 124,
    views: 856,
    status: 'active',
    createdAt: new Date('2025-08-25T10:30:00.000Z'),
    updatedAt: new Date('2025-08-25T10:30:00.000Z'),
    location: 'Mumbai, Maharashtra',
    tags: ['emergency', 'healthcare', 'medical']
  },
  {
    _id: '66d1234567890abcdef12346',
    title: 'Education Scholarship Program',
    category: 'Education',
    beneficiaries: 30,
    amount: 18500,
    details: 'Funded school fees, textbooks, uniforms, and stationery for underprivileged children for an entire academic year. This initiative helped increase school enrollment in rural areas.',
    authorName: 'Maria Rodriguez',
    authorId: null,
    isVerified: false,
    likes: 89,
    views: 432,
    status: 'active',
    createdAt: new Date('2025-08-22T14:15:00.000Z'),
    updatedAt: new Date('2025-08-22T14:15:00.000Z'),
    location: 'Bangalore, Karnataka',
    tags: ['education', 'scholarship', 'children']
  },
  {
    _id: '66d1234567890abcdef12347',
    title: 'Community Food Distribution Drive',
    category: 'Food & Nutrition',
    beneficiaries: 150,
    amount: 35000,
    details: 'Organized weekly food distribution for homeless and underprivileged families. Provided nutritious meals and grocery kits to ensure no one goes hungry.',
    authorName: 'Volunteer Team Delhi',
    authorId: null,
    isVerified: true,
    likes: 256,
    views: 1203,
    status: 'active',
    createdAt: new Date('2025-08-20T09:00:00.000Z'),
    updatedAt: new Date('2025-08-20T09:00:00.000Z'),
    location: 'New Delhi',
    tags: ['food', 'nutrition', 'community', 'hunger']
  },
  {
    _id: '66d1234567890abcdef12348',
    title: 'Clean Water Initiative',
    category: 'Environment',
    beneficiaries: 80,
    amount: 42000,
    details: 'Installed water purification systems in rural villages and conducted awareness programs about water conservation and hygiene practices.',
    authorName: 'Green Earth Foundation',
    authorId: null,
    isVerified: true,
    likes: 178,
    views: 634,
    status: 'active',
    createdAt: new Date('2025-08-18T16:45:00.000Z'),
    updatedAt: new Date('2025-08-18T16:45:00.000Z'),
    location: 'Rajasthan',
    tags: ['water', 'environment', 'rural', 'health']
  }
];

const impactPostService = {
  async getAllPosts(filters) {
    const { page, limit, category, status, author, search, sortBy, sortOrder } = filters;
    
    // Create cache key based on filters (only for cacheable queries)
    const shouldCache = page === 1 && !search && !author;
    const cacheKey = shouldCache ? `impactposts:list:${category || 'all'}:${status || 'all'}:${sortBy}:${sortOrder}:${limit}` : null;
    
    // Try cache first (only for page 1 without search/author filters)
    if (shouldCache) {
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        console.log('✅ Impact posts served from cache');
        return cached;
      }
    }
    
    if (ImpactPost) {
      console.log('🔄 Using MongoDB database');
      
      let filter = {};
      
      if (status && status !== 'all') {
        if (status.includes(',')) {
          filter.status = { $in: status.split(',') };
        } else {
          filter.status = status;
        }
      } else {
        filter.status = { $in: ['active', 'completed'] };
      }
      
      if (category && category !== 'all') {
        filter.category = category;
      }
      
      if (author) {
        filter.authorId = author;
      }
      
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { details: { $regex: search, $options: 'i' } },
          { authorName: { $regex: search, $options: 'i' } }
        ];
      }
      
      console.log('🔍 Database filter:', JSON.stringify(filter, null, 2));
      
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      const skip = (page - 1) * limit;
      
      const posts = await ImpactPost.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'name email avatar')
        .lean();
      
      const total = await ImpactPost.countDocuments(filter);
      
      console.log(`✅ Found ${posts.length} posts out of ${total} total`);
      
      const result = {
        success: true,
        data: {
          posts: posts || []
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNext: skip + posts.length < total,
          hasPrev: page > 1
        }
      };
      
      // Cache the result for 3 minutes (only for common queries)
      if (shouldCache) {
        await cacheService.set(cacheKey, result, 180);
      }
      
      return result;
      
    } else {
      console.log('🔄 Using mock data (database unavailable)');
      
      let filteredPosts = [...mockPosts];
      
      if (category && category !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category === category);
      }
      
      if (status && status !== 'all') {
        const statusArray = status.includes(',') ? status.split(',') : [status];
        filteredPosts = filteredPosts.filter(post => statusArray.includes(post.status));
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredPosts = filteredPosts.filter(post => 
          post.title.toLowerCase().includes(searchLower) ||
          post.details.toLowerCase().includes(searchLower) ||
          post.authorName.toLowerCase().includes(searchLower)
        );
      }
      
      filteredPosts.sort((a, b) => {
        if (sortBy === 'createdAt') {
          return sortOrder === 'desc' ? 
            new Date(b.createdAt) - new Date(a.createdAt) : 
            new Date(a.createdAt) - new Date(b.createdAt);
        }
        return 0;
      });
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
      
      console.log(`✅ Mock: Found ${paginatedPosts.length} posts out of ${filteredPosts.length} total`);
      
      const result = {
        success: true,
        data: {
          posts: paginatedPosts
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredPosts.length / limit),
          totalPosts: filteredPosts.length,
          hasNext: endIndex < filteredPosts.length,
          hasPrev: page > 1
        }
      };
      
      // Cache mock results too (3 minutes)
      if (shouldCache) {
        await cacheService.set(cacheKey, result, 180);
      }
      
      return result;
    }
  },

  async createPost(postData) {
    const { 
      title, 
      category, 
      beneficiaries = 0, 
      amount = 0, 
      details, 
      authorId, 
      authorName = 'Anonymous',
      location,
      tags = []
    } = postData;

    const errors = [];
    if (!title || title.trim().length === 0) {
      errors.push('Title is required');
    }
    if (!category) {
      errors.push('Category is required');
    }
    if (!details || details.trim().length < 10) {
      errors.push('Details must be at least 10 characters long');
    }
    
    if (errors.length > 0) {
      console.log('❌ Validation errors:', errors);
      throw new ImpactPostError('Validation failed', 400, errors);
    }

    if (ImpactPost) {
      console.log('💾 Saving to MongoDB database');
      
      const newPost = new ImpactPost({
        title: title.trim(),
        category,
        beneficiaries: parseInt(beneficiaries) || 0,
        amount: parseInt(amount) || 0,
        details: details.trim(),
        authorId: authorId || null,
        authorName: authorName.trim() || 'Anonymous',
        status: 'active',
        isVerified: false,
        likes: 0,
        views: 0,
        location: location?.trim() || '',
        tags: Array.isArray(tags) ? tags : []
      });

      const savedPost = await newPost.save();
      
      if (authorId) {
        await savedPost.populate('authorId', 'name email avatar');
      }
      
      // Invalidate all impact posts caches
      await cacheService.delPattern('impactposts:list:*');
      await cacheService.delPattern('impactposts:category:*');
      await cacheService.del('impactposts:stats');
      
      console.log('🗑️ Cache invalidated after creating new post');
      
      return savedPost;
      
    } else {
      console.log('💾 Saving to mock data');
      
      const newPost = {
        _id: `mock_${Date.now()}`,
        title: title.trim(),
        category,
        beneficiaries: parseInt(beneficiaries) || 0,
        amount: parseInt(amount) || 0,
        details: details.trim(),
        authorId: authorId || null,
        authorName: authorName.trim() || 'Anonymous',
        status: 'active',
        isVerified: false,
        likes: 0,
        views: 0,
        location: location?.trim() || '',
        tags: Array.isArray(tags) ? tags : [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPosts.unshift(newPost);
      
      // Invalidate caches
      await cacheService.delPattern('impactposts:list:*');
      await cacheService.delPattern('impactposts:category:*');
      await cacheService.del('impactposts:stats');
      
      return newPost;
    }
  },

  async getPostById(postId) {
    const cacheKey = `impactpost:${postId}`;
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Impact post served from cache:', postId);
      // Still increment views but don't block on it
      if (ImpactPost) {
        ImpactPost.findByIdAndUpdate(postId, { $inc: { views: 1 } }).exec();
      }
      return cached;
    }
    
    if (ImpactPost) {
      const post = await ImpactPost.findById(postId)
        .populate('authorId', 'name email avatar');
        
      if (!post) {
        throw new ImpactPostError('Impact post not found', 404);
      }
      
      // Increment views
      ImpactPost.findByIdAndUpdate(postId, { $inc: { views: 1 } }).exec();
      
      // Cache for 5 minutes
      await cacheService.set(cacheKey, post, 300);
      
      return post;
      
    } else {
      const post = mockPosts.find(p => p._id === postId);
      if (!post) {
        throw new ImpactPostError('Impact post not found', 404);
      }
      
      post.views = (post.views || 0) + 1;
      
      // Cache for 5 minutes
      await cacheService.set(cacheKey, post, 300);
      
      return post;
    }
  },

  async updatePost(postId, updateData) {
    if (ImpactPost) {
      const updatedPost = await ImpactPost.findByIdAndUpdate(
        postId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('authorId', 'name email avatar');
      
      if (!updatedPost) {
        throw new ImpactPostError('Impact post not found', 404);
      }
      
      // Invalidate caches
      await cacheService.del(`impactpost:${postId}`);
      await cacheService.delPattern('impactposts:list:*');
      await cacheService.delPattern('impactposts:category:*');
      await cacheService.del('impactposts:stats');
      
      console.log('🗑️ Cache invalidated after updating post:', postId);
      
      return updatedPost;
      
    } else {
      const postIndex = mockPosts.findIndex(p => p._id === postId);
      if (postIndex === -1) {
        throw new ImpactPostError('Impact post not found', 404);
      }
      
      mockPosts[postIndex] = { 
        ...mockPosts[postIndex], 
        ...updateData, 
        updatedAt: new Date() 
      };
      
      // Invalidate caches
      await cacheService.del(`impactpost:${postId}`);
      await cacheService.delPattern('impactposts:list:*');
      await cacheService.delPattern('impactposts:category:*');
      await cacheService.del('impactposts:stats');
      
      return mockPosts[postIndex];
    }
  },

  async deletePost(postId) {
    if (ImpactPost) {
      const deletedPost = await ImpactPost.findByIdAndDelete(postId);
      if (!deletedPost) {
        throw new ImpactPostError('Impact post not found', 404);
      }
      
      // Invalidate all related caches
      await cacheService.del(`impactpost:${postId}`);
      await cacheService.delPattern('impactposts:list:*');
      await cacheService.delPattern('impactposts:category:*');
      await cacheService.del('impactposts:stats');
      
      console.log('🗑️ Cache invalidated after deleting post:', postId);
      
    } else {
      const postIndex = mockPosts.findIndex(p => p._id === postId);
      if (postIndex === -1) {
        throw new ImpactPostError('Impact post not found', 404);
      }
      
      mockPosts.splice(postIndex, 1);
      
      // Invalidate caches
      await cacheService.del(`impactpost:${postId}`);
      await cacheService.delPattern('impactposts:list:*');
      await cacheService.delPattern('impactposts:category:*');
      await cacheService.del('impactposts:stats');
    }
  },

  async likePost(postId) {
    if (ImpactPost) {
      const post = await ImpactPost.findByIdAndUpdate(
        postId,
        { $inc: { likes: 1 } },
        { new: true }
      );
      
      if (!post) {
        throw new ImpactPostError('Impact post not found', 404);
      }
      
      // Invalidate specific post cache only (not lists)
      await cacheService.del(`impactpost:${postId}`);
      
      // Track like in Redis for real-time updates
      await cacheService.incr(`impactpost:${postId}:likes`, 3600); // 1 hour TTL
      
      return post.likes;
      
    } else {
      const post = mockPosts.find(p => p._id === postId);
      if (!post) {
        throw new ImpactPostError('Impact post not found', 404);
      }
      
      post.likes = (post.likes || 0) + 1;
      
      // Invalidate cache
      await cacheService.del(`impactpost:${postId}`);
      await cacheService.incr(`impactpost:${postId}:likes`, 3600);
      
      return post.likes;
    }
  },

  async unlikePost(postId) {
    if (ImpactPost) {
      const post = await ImpactPost.findByIdAndUpdate(
        postId,
        { $inc: { likes: -1 } },
        { new: true }
      );
      
      if (!post) {
        throw new ImpactPostError('Impact post not found', 404);
      }
      
      if (post.likes < 0) {
        await ImpactPost.findByIdAndUpdate(postId, { likes: 0 });
        
        // Invalidate cache
        await cacheService.del(`impactpost:${postId}`);
        await cacheService.del(`impactpost:${postId}:likes`);
        
        return 0;
      }
      
      // Invalidate cache
      await cacheService.del(`impactpost:${postId}`);
      await cacheService.del(`impactpost:${postId}:likes`);
      
      return post.likes;
      
    } else {
      const post = mockPosts.find(p => p._id === postId);
      if (!post) {
        throw new ImpactPostError('Impact post not found', 404);
      }
      
      post.likes = Math.max(0, (post.likes || 0) - 1);
      
      // Invalidate cache
      await cacheService.del(`impactpost:${postId}`);
      await cacheService.del(`impactpost:${postId}:likes`);
      
      return post.likes;
    }
  },

  async getPostsByCategory(category) {
    const cacheKey = `impactposts:category:${category}`;
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Category posts served from cache:', category);
      return cached;
    }
    
    if (ImpactPost) {
      const posts = await ImpactPost.find({ 
        category: category,
        status: { $in: ['active', 'completed'] }
      })
      .sort({ createdAt: -1 })
      .populate('authorId', 'name email avatar');
      
      const result = posts || [];
      
      // Cache for 5 minutes
      await cacheService.set(cacheKey, result, 300);
      
      return result;
      
    } else {
      const posts = mockPosts.filter(p => 
        p.category === category && 
        ['active', 'completed'].includes(p.status)
      );
      
      // Cache for 5 minutes
      await cacheService.set(cacheKey, posts, 300);
      
      return posts;
    }
  },

  async getStatistics() {
    const cacheKey = 'impactposts:stats';
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Statistics served from cache');
      return cached;
    }
    
    if (ImpactPost) {
      const [
        totalPosts,
        activePosts,
        completedPosts,
        beneficiariesResult,
        amountResult,
        categoryStats
      ] = await Promise.all([
        ImpactPost.countDocuments(),
        ImpactPost.countDocuments({ status: 'active' }),
        ImpactPost.countDocuments({ status: 'completed' }),
        ImpactPost.aggregate([
          { $group: { _id: null, total: { $sum: '$beneficiaries' } } }
        ]),
        ImpactPost.aggregate([
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        ImpactPost.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
          { $sort: { count: -1 } }
        ])
      ]);
      
      const stats = {
        totalPosts,
        activePosts,
        completedPosts,
        totalBeneficiaries: beneficiariesResult[0]?.total || 0,
        totalAmount: amountResult[0]?.total || 0,
        categoryStats: categoryStats || []
      };
      
      // Cache for 10 minutes
      await cacheService.set(cacheKey, stats, 600);
      
      return stats;
      
    } else {
      const totalPosts = mockPosts.length;
      const activePosts = mockPosts.filter(p => p.status === 'active').length;
      const completedPosts = mockPosts.filter(p => p.status === 'completed').length;
      const totalBeneficiaries = mockPosts.reduce((sum, post) => sum + (post.beneficiaries || 0), 0);
      const totalAmount = mockPosts.reduce((sum, post) => sum + (post.amount || 0), 0);
      
      const categoryMap = {};
      mockPosts.forEach(post => {
        if (!categoryMap[post.category]) {
          categoryMap[post.category] = { count: 0, totalAmount: 0 };
        }
        categoryMap[post.category].count++;
        categoryMap[post.category].totalAmount += post.amount || 0;
      });
      
      const categoryStats = Object.entries(categoryMap).map(([category, data]) => ({
        _id: category,
        ...data
      }));
      
      const stats = {
        totalPosts,
        activePosts,
        completedPosts,
        totalBeneficiaries,
        totalAmount,
        categoryStats
      };
      
      // Cache for 10 minutes
      await cacheService.set(cacheKey, stats, 600);
      
      return stats;
    }
  }
};

module.exports = impactPostService;
