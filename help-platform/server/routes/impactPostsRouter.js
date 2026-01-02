const express = require('express');
const router = express.Router();
const cacheService = require('../services/cache'); // ✅ ADD CACHE

// ✅ CRITICAL: Improved model loading with better error handling
let ImpactPost;
try {
  ImpactPost = require('../models/ImpactPost');
  console.log('✅ ImpactPost model loaded successfully from:', require.resolve('../models/ImpactPost'));
} catch (error) {
  console.error('❌ Failed to load ImpactPost model:', error.message);
  console.log('⚠️ Falling back to mock mode');
  ImpactPost = null;
}

// Enhanced mock data with more realistic entries
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

// ==================== GET ALL POSTS ====================
router.get('/', async (req, res) => {
  try {
    console.log('📖 GET /api/impact-posts - Request received');
    console.log('📖 Query parameters:', req.query);
    
    const { 
      page = 1, 
      limit = 50, 
      category, 
      status = 'active', 
      author, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // ✅ CACHE KEY
    const cacheKey = `impact-posts:${status}:${category || 'all'}:${author || 'all'}:${search || 'none'}:${sortBy}:${sortOrder}:page${page}:limit${limit}`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Impact posts served from cache');
      return res.json({
        success: true,
        data: cached.data,
        pagination: cached.pagination
      });
    }
    
    if (ImpactPost) {
      console.log('🔄 Using MongoDB database');
      
      // Build filter object
      let filter = {};
      
      // Status filter
      if (status && status !== 'all') {
        if (status.includes(',')) {
          filter.status = { $in: status.split(',') };
        } else {
          filter.status = status;
        }
      } else {
        filter.status = { $in: ['active', 'completed'] };
      }
      
      // Category filter
      if (category && category !== 'all') {
        filter.category = category;
      }
      
      // Author filter
      if (author) {
        filter.authorId = author;
      }
      
      // Search filter
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { details: { $regex: search, $options: 'i' } },
          { authorName: { $regex: search, $options: 'i' } }
        ];
      }
      
      console.log('🔍 Database filter:', JSON.stringify(filter, null, 2));
      
      // Sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const posts = await ImpactPost.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('authorId', 'name email avatar')
        .lean();
      
      const total = await ImpactPost.countDocuments(filter);
      
      console.log(`✅ Found ${posts.length} posts out of ${total} total`);
      
      const result = {
        data: {
          posts: posts || []
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalPosts: total,
          hasNext: skip + posts.length < total,
          hasPrev: parseInt(page) > 1
        }
      };

      // ✅ CACHE FOR 5 MINUTES
      await cacheService.set(cacheKey, result, 300);
      
      console.log('📤 Sending response with', posts.length, 'posts');
      res.json({
        success: true,
        ...result
      });
      
    } else {
      console.log('🔄 Using mock data (database unavailable)');
      
      // Filter mock data
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
      
      // Sort mock data
      filteredPosts.sort((a, b) => {
        if (sortBy === 'createdAt') {
          return sortOrder === 'desc' ? 
            new Date(b.createdAt) - new Date(a.createdAt) : 
            new Date(a.createdAt) - new Date(b.createdAt);
        }
        return 0;
      });
      
      // Paginate mock data
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
      
      console.log(`✅ Mock: Found ${paginatedPosts.length} posts out of ${filteredPosts.length} total`);
      
      const result = {
        data: {
          posts: paginatedPosts
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredPosts.length / parseInt(limit)),
          totalPosts: filteredPosts.length,
          hasNext: endIndex < filteredPosts.length,
          hasPrev: parseInt(page) > 1
        }
      };

      // ✅ CACHE FOR 5 MINUTES
      await cacheService.set(cacheKey, result, 300);
      
      res.json({
        success: true,
        ...result
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching impact posts:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch impact posts',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      data: {
        posts: []
      }
    });
  }
});

// ==================== CREATE POST ====================
router.post('/', async (req, res) => {
  try {
    console.log('📝 POST /api/impact-posts - Creating new post');
    console.log('📝 Request body:', req.body);
    
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
    } = req.body;

    // Enhanced validation
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
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        details: errors
      });
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
      
      // Populate author if exists
      if (authorId) {
        await savedPost.populate('authorId', 'name email avatar');
      }
      
      console.log('✅ Post created successfully with ID:', savedPost._id);

      // ✅ INVALIDATE CACHES
      await cacheService.delPattern('impact-posts:*');
      console.log('🗑️ Impact posts cache invalidated after creation');
      
      res.status(201).json({
        success: true,
        data: savedPost,
        message: 'Impact post created successfully'
      });
      
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
      
      console.log('✅ Mock post created successfully with ID:', newPost._id);

      // ✅ INVALIDATE CACHES
      await cacheService.delPattern('impact-posts:*');
      console.log('🗑️ Impact posts cache invalidated after creation (mock)');
      
      res.status(201).json({
        success: true,
        data: newPost,
        message: 'Impact post created successfully (mock mode)'
      });
    }
    
  } catch (error) {
    console.error('❌ Error creating impact post:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to create impact post', 
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ==================== GET SINGLE POST ====================
router.get('/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    console.log('📖 GET /api/impact-posts/:id - Fetching post:', postId);

    // ✅ CACHE KEY
    const cacheKey = `impact-post:${postId}`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Impact post served from cache:', postId);
      // Increment view count asynchronously (don't wait)
      if (ImpactPost) {
        ImpactPost.findByIdAndUpdate(postId, { $inc: { views: 1 } }).exec();
      }
      return res.json({
        success: true,
        data: cached
      });
    }
    
    if (ImpactPost) {
      const post = await ImpactPost.findById(postId)
        .populate('authorId', 'name email avatar');
        
      if (!post) {
        return res.status(404).json({ 
          success: false,
          error: 'Impact post not found' 
        });
      }
      
      // Increment view count asynchronously
      ImpactPost.findByIdAndUpdate(postId, { $inc: { views: 1 } }).exec();

      console.log('✅ Impact post fetched from DB:', postId);

      // ✅ CACHE FOR 5 MINUTES
      await cacheService.set(cacheKey, post, 300);
      
      res.json({
        success: true,
        data: post
      });
      
    } else {
      // Mock data lookup
      const post = mockPosts.find(p => p._id === postId);
      if (!post) {
        return res.status(404).json({ 
          success: false,
          error: 'Impact post not found' 
        });
      }
      
      // Increment mock view count
      post.views = (post.views || 0) + 1;

      // ✅ CACHE FOR 5 MINUTES
      await cacheService.set(cacheKey, post, 300);
      
      res.json({
        success: true,
        data: post
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching impact post:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch impact post',
      details: error.message 
    });
  }
});

// ==================== UPDATE POST ====================
router.put('/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    console.log('✏️ PUT /api/impact-posts/:id - Updating post:', postId);
    console.log('✏️ Update data:', req.body);
    
    if (ImpactPost) {
      const updatedPost = await ImpactPost.findByIdAndUpdate(
        postId,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('authorId', 'name email avatar');
      
      if (!updatedPost) {
        return res.status(404).json({ 
          success: false,
          error: 'Impact post not found' 
        });
      }

      console.log('✅ Post updated successfully:', postId);

      // ✅ INVALIDATE CACHES
      await cacheService.del(`impact-post:${postId}`);
      await cacheService.delPattern('impact-posts:*');
      console.log('🗑️ Impact post caches invalidated after update');
      
      res.json({
        success: true,
        data: updatedPost,
        message: 'Impact post updated successfully'
      });
      
    } else {
      // Mock update
      const postIndex = mockPosts.findIndex(p => p._id === postId);
      if (postIndex === -1) {
        return res.status(404).json({ 
          success: false,
          error: 'Impact post not found' 
        });
      }
      
      mockPosts[postIndex] = { 
        ...mockPosts[postIndex], 
        ...req.body, 
        updatedAt: new Date() 
      };

      // ✅ INVALIDATE CACHES
      await cacheService.del(`impact-post:${postId}`);
      await cacheService.delPattern('impact-posts:*');
      console.log('🗑️ Impact post caches invalidated after update (mock)');
      
      res.json({
        success: true,
        data: mockPosts[postIndex],
        message: 'Impact post updated successfully (mock mode)'
      });
    }
    
  } catch (error) {
    console.error('❌ Error updating impact post:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update impact post',
      details: error.message 
    });
  }
});

// ==================== DELETE POST ====================
router.delete('/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    console.log('🗑️ DELETE /api/impact-posts/:id - Deleting post:', postId);
    
    if (ImpactPost) {
      const deletedPost = await ImpactPost.findByIdAndDelete(postId);
      if (!deletedPost) {
        return res.status(404).json({ 
          success: false,
          error: 'Impact post not found' 
        });
      }

      console.log('✅ Post deleted successfully:', postId);

      // ✅ INVALIDATE CACHES
      await cacheService.del(`impact-post:${postId}`);
      await cacheService.delPattern('impact-posts:*');
      console.log('🗑️ Impact post caches invalidated after deletion');
      
      res.json({ 
        success: true,
        message: 'Impact post deleted successfully' 
      });
      
    } else {
      // Mock delete
      const postIndex = mockPosts.findIndex(p => p._id === postId);
      if (postIndex === -1) {
        return res.status(404).json({ 
          success: false,
          error: 'Impact post not found' 
        });
      }
      
      mockPosts.splice(postIndex, 1);

      // ✅ INVALIDATE CACHES
      await cacheService.del(`impact-post:${postId}`);
      await cacheService.delPattern('impact-posts:*');
      console.log('🗑️ Impact post caches invalidated after deletion (mock)');
      
      res.json({ 
        success: true,
        message: 'Impact post deleted successfully (mock mode)' 
      });
    }
    
  } catch (error) {
    console.error('❌ Error deleting impact post:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete impact post',
      details: error.message 
    });
  }
});

// ==================== LIKE POST ====================
router.post('/:id/like', async (req, res) => {
  try {
    const postId = req.params.id;
    console.log('👍 POST /api/impact-posts/:id/like - Liking post:', postId);
    
    if (ImpactPost) {
      const post = await ImpactPost.findByIdAndUpdate(
        postId,
        { $inc: { likes: 1 } },
        { new: true }
      );
      
      if (!post) {
        return res.status(404).json({ 
          success: false,
          error: 'Impact post not found' 
        });
      }

      // ✅ INVALIDATE POST CACHE (likes changed)
      await cacheService.del(`impact-post:${postId}`);
      console.log('🗑️ Impact post cache invalidated after like');
      
      res.json({ 
        success: true,
        message: 'Post liked successfully', 
        data: { likes: post.likes }
      });
      
    } else {
      // Mock like
      const post = mockPosts.find(p => p._id === postId);
      if (!post) {
        return res.status(404).json({ 
          success: false,
          error: 'Impact post not found' 
        });
      }
      
      post.likes = (post.likes || 0) + 1;

      // ✅ INVALIDATE POST CACHE
      await cacheService.del(`impact-post:${postId}`);
      console.log('🗑️ Impact post cache invalidated after like (mock)');
      
      res.json({ 
        success: true,
        message: 'Post liked successfully (mock mode)', 
        data: { likes: post.likes }
      });
    }
    
  } catch (error) {
    console.error('❌ Error liking impact post:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to like post',
      details: error.message 
    });
  }
});

// ==================== UNLIKE POST ====================
router.delete('/:id/like', async (req, res) => {
  try {
    const postId = req.params.id;
    console.log('👎 DELETE /api/impact-posts/:id/like - Unliking post:', postId);
    
    if (ImpactPost) {
      const post = await ImpactPost.findByIdAndUpdate(
        postId,
        { $inc: { likes: -1 } },
        { new: true }
      );
      
      if (!post) {
        return res.status(404).json({ 
          success: false,
          error: 'Impact post not found' 
        });
      }
      
      // Ensure likes don't go below 0
      if (post.likes < 0) {
        await ImpactPost.findByIdAndUpdate(postId, { likes: 0 });
        post.likes = 0;
      }

      // ✅ INVALIDATE POST CACHE
      await cacheService.del(`impact-post:${postId}`);
      console.log('🗑️ Impact post cache invalidated after unlike');
      
      res.json({ 
        success: true,
        message: 'Post unliked successfully', 
        data: { likes: post.likes }
      });
      
    } else {
      // Mock unlike
      const post = mockPosts.find(p => p._id === postId);
      if (!post) {
        return res.status(404).json({ 
          success: false,
          error: 'Impact post not found' 
        });
      }
      
      post.likes = Math.max(0, (post.likes || 0) - 1);

      // ✅ INVALIDATE POST CACHE
      await cacheService.del(`impact-post:${postId}`);
      console.log('🗑️ Impact post cache invalidated after unlike (mock)');
      
      res.json({ 
        success: true,
        message: 'Post unliked successfully (mock mode)', 
        data: { likes: post.likes }
      });
    }
    
  } catch (error) {
    console.error('❌ Error unliking impact post:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to unlike post',
      details: error.message 
    });
  }
});

// ==================== GET POSTS BY CATEGORY ====================
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    console.log('📂 GET /api/impact-posts/category/:category - Fetching posts for category:', category);

    // ✅ CACHE KEY
    const cacheKey = `impact-posts:category:${category}`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Impact posts by category served from cache:', category);
      return res.json({
        success: true,
        data: cached
      });
    }
    
    if (ImpactPost) {
      const posts = await ImpactPost.find({ 
        category: category,
        status: { $in: ['active', 'completed'] }
      })
      .sort({ createdAt: -1 })
      .populate('authorId', 'name email avatar');

      console.log(`✅ Found ${posts.length} posts for category:`, category);

      // ✅ CACHE FOR 5 MINUTES
      await cacheService.set(cacheKey, posts || [], 300);
      
      res.json({
        success: true,
        data: posts || []
      });
      
    } else {
      // Mock category filter
      const posts = mockPosts.filter(p => 
        p.category === category && 
        ['active', 'completed'].includes(p.status)
      );

      // ✅ CACHE FOR 5 MINUTES
      await cacheService.set(cacheKey, posts, 300);
      
      res.json({
        success: true,
        data: posts
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching posts by category:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch posts by category',
      details: error.message,
      data: []
    });
  }
});

// ==================== GET STATISTICS ====================
router.get('/stats/summary', async (req, res) => {
  try {
    console.log('📊 GET /api/impact-posts/stats/summary - Fetching statistics...');

    // ✅ CACHE KEY
    const cacheKey = 'impact-posts:stats';

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Impact posts stats served from cache');
      return res.json({
        success: true,
        data: cached
      });
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

      console.log('✅ Impact posts stats calculated');

      // ✅ CACHE FOR 5 MINUTES
      await cacheService.set(cacheKey, stats, 300);
      
      res.json({
        success: true,
        data: stats
      });
      
    } else {
      // Mock statistics
      const totalPosts = mockPosts.length;
      const activePosts = mockPosts.filter(p => p.status === 'active').length;
      const completedPosts = mockPosts.filter(p => p.status === 'completed').length;
      const totalBeneficiaries = mockPosts.reduce((sum, post) => sum + (post.beneficiaries || 0), 0);
      const totalAmount = mockPosts.reduce((sum, post) => sum + (post.amount || 0), 0);
      
      // Mock category stats
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

      // ✅ CACHE FOR 5 MINUTES
      await cacheService.set(cacheKey, stats, 300);
      
      res.json({
        success: true,
        data: stats
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch statistics',
      details: error.message 
    });
  }
});

module.exports = router;
