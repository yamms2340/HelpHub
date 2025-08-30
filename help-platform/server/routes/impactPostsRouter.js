const express = require('express');
const router = express.Router();

// Try to use actual model, fallback gracefully
let ImpactPost;
try {
  ImpactPost = require('../models/ImpactPost');
  console.log('✅ ImpactPost model loaded successfully');
} catch (error) {
  console.log('⚠️ ImpactPost model not found, using fallback mode');
  ImpactPost = null;
}

// Mock data for fallback mode
const mockPosts = [
  {
    _id: '1',
    title: 'Emergency Medical Support for Families',
    category: 'Healthcare',
    beneficiaries: 45,
    amount: 25000,
    details: 'Covered ambulance services, emergency medicines, and hospital fees for families who could not afford treatment.',
    authorName: 'Dr. Sarah Johnson',
    isVerified: true,
    likes: 124,
    views: 856,
    status: 'active',
    createdAt: new Date('2025-08-20')
  },
  {
    _id: '2',
    title: 'Education Scholarship Program',
    category: 'Education',
    beneficiaries: 30,
    amount: 18500,
    details: 'Funded school fees, textbooks, uniforms, and stationery for an entire academic year.',
    authorName: 'Maria Rodriguez',
    isVerified: false,
    likes: 89,
    views: 432,
    status: 'active',
    createdAt: new Date('2025-08-15')
  }
];

// ✅ GET all posts with filtering and pagination
router.get('/', async (req, res) => {
  try {
    console.log('📖 GET /api/impact-posts - Fetching posts...');
    const { page = 1, limit = 50, category, status, author } = req.query;
    
    if (ImpactPost) {
      // Use database
      let query = { status: { $in: ['active', 'completed'] } };
      
      // Add filters
      if (category && category !== 'all') {
        query.category = category;
      }
      if (status && status !== 'all') {
        query.status = status;
      }
      if (author) {
        query.authorId = author;
      }

      const posts = await ImpactPost.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('authorId', 'name email');

      const total = await ImpactPost.countDocuments(query);
      
      res.json({
        success: true,
        data: { posts },
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    } else {
      // Use mock data
      let filteredPosts = [...mockPosts];
      
      if (category && category !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category === category);
      }
      if (status && status !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.status === status);
      }
      
      res.json({
        success: true,
        data: { posts: filteredPosts },
        totalPages: 1,
        currentPage: 1,
        total: filteredPosts.length
      });
    }
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch posts',
      details: error.message 
    });
  }
});

// ✅ POST a new post (CREATE) - FIXED RESPONSE FORMAT
router.post('/', async (req, res) => {
  try {
    console.log('📝 POST /api/impact-posts - Creating post with data:', req.body);
    
    const { title, category, beneficiaries, amount, details, authorId, authorName } = req.body;

    // Validation
    if (!title || !category || !details) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: title, category, details' 
      });
    }

    if (ImpactPost) {
      // Use database
      const newPost = new ImpactPost({
        title: title.trim(),
        category,
        beneficiaries: parseInt(beneficiaries) || 0,
        amount: parseInt(amount) || 0,
        details: details.trim(),
        authorId: authorId || null,
        authorName: authorName?.trim() || 'Anonymous',
        status: 'active',
        isVerified: false,
        likes: 0,
        views: 0
      });

      const savedPost = await newPost.save();
      
      if (authorId) {
        await savedPost.populate('authorId', 'name email');
      }
      
      console.log('✅ Post created successfully with ID:', savedPost._id);
      
      res.status(201).json({
        success: true,
        data: savedPost,
        message: 'Impact post created successfully'
      });
    } else {
      // Use mock data (fallback)
      const newPost = {
        _id: Date.now().toString(),
        title: title.trim(),
        category,
        beneficiaries: parseInt(beneficiaries) || 0,
        amount: parseInt(amount) || 0,
        details: details.trim(),
        authorName: authorName?.trim() || 'Anonymous',
        status: 'active',
        isVerified: false,
        likes: 0,
        views: 0,
        createdAt: new Date()
      };

      mockPosts.unshift(newPost);
      
      console.log('✅ Mock post created successfully with ID:', newPost._id);
      
      res.status(201).json({
        success: true,
        data: newPost,
        message: 'Impact post created successfully (mock mode)'
      });
    }
  } catch (error) {
    console.error('❌ Error creating post:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create post', 
      details: error.message 
    });
  }
});

// ✅ GET single post by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('📖 GET /api/impact-posts/:id - Fetching post:', req.params.id);
    
    if (ImpactPost) {
      const post = await ImpactPost.findById(req.params.id)
        .populate('authorId', 'name email');
        
      if (!post) {
        return res.status(404).json({ 
          success: false,
          error: 'Post not found' 
        });
      }
      
      // Increment view count
      await ImpactPost.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
      
      res.json({
        success: true,
        data: post
      });
    } else {
      // Use mock data
      const post = mockPosts.find(p => p._id === req.params.id);
      if (!post) {
        return res.status(404).json({ 
          success: false,
          error: 'Post not found' 
        });
      }
      
      // Increment mock view count
      post.views = (post.views || 0) + 1;
      
      res.json({
        success: true,
        data: post
      });
    }
  } catch (error) {
    console.error('❌ Error fetching post:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch post',
      details: error.message 
    });
  }
});

// ✅ PUT update post
router.put('/:id', async (req, res) => {
  try {
    console.log('✏️ PUT /api/impact-posts/:id - Updating post:', req.params.id);
    
    if (ImpactPost) {
      const updatedPost = await ImpactPost.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('authorId', 'name email');
      
      if (!updatedPost) {
        return res.status(404).json({ 
          success: false,
          error: 'Post not found' 
        });
      }
      
      res.json({
        success: true,
        data: updatedPost,
        message: 'Post updated successfully'
      });
    } else {
      // Mock update
      const postIndex = mockPosts.findIndex(p => p._id === req.params.id);
      if (postIndex === -1) {
        return res.status(404).json({ 
          success: false,
          error: 'Post not found' 
        });
      }
      
      mockPosts[postIndex] = { ...mockPosts[postIndex], ...req.body };
      
      res.json({
        success: true,
        data: mockPosts[postIndex],
        message: 'Post updated successfully (mock mode)'
      });
    }
  } catch (error) {
    console.error('❌ Error updating post:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update post',
      details: error.message 
    });
  }
});

// ✅ DELETE post
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/impact-posts/:id - Deleting post:', req.params.id);
    
    if (ImpactPost) {
      const deletedPost = await ImpactPost.findByIdAndDelete(req.params.id);
      if (!deletedPost) {
        return res.status(404).json({ 
          success: false,
          error: 'Post not found' 
        });
      }
      res.json({ 
        success: true,
        message: 'Post deleted successfully' 
      });
    } else {
      // Mock delete
      const postIndex = mockPosts.findIndex(p => p._id === req.params.id);
      if (postIndex === -1) {
        return res.status(404).json({ 
          success: false,
          error: 'Post not found' 
        });
      }
      
      mockPosts.splice(postIndex, 1);
      res.json({ 
        success: true,
        message: 'Post deleted successfully (mock mode)' 
      });
    }
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete post',
      details: error.message 
    });
  }
});

// ✅ POST like a post
router.post('/:id/like', async (req, res) => {
  try {
    console.log('👍 POST /api/impact-posts/:id/like - Liking post:', req.params.id);
    
    if (ImpactPost) {
      const post = await ImpactPost.findByIdAndUpdate(
        req.params.id,
        { $inc: { likes: 1 } },
        { new: true }
      );
      
      if (!post) {
        return res.status(404).json({ 
          success: false,
          error: 'Post not found' 
        });
      }
      
      res.json({ 
        success: true,
        message: 'Post liked successfully', 
        data: { likes: post.likes }
      });
    } else {
      // Mock like
      const post = mockPosts.find(p => p._id === req.params.id);
      if (!post) {
        return res.status(404).json({ 
          success: false,
          error: 'Post not found' 
        });
      }
      
      post.likes = (post.likes || 0) + 1;
      res.json({ 
        success: true,
        message: 'Post liked successfully (mock mode)', 
        data: { likes: post.likes }
      });
    }
  } catch (error) {
    console.error('❌ Error liking post:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to like post',
      details: error.message 
    });
  }
});

// ✅ DELETE unlike a post
router.delete('/:id/like', async (req, res) => {
  try {
    console.log('👎 DELETE /api/impact-posts/:id/like - Unliking post:', req.params.id);
    
    if (ImpactPost) {
      const post = await ImpactPost.findByIdAndUpdate(
        req.params.id,
        { $inc: { likes: -1 } },
        { new: true }
      );
      
      if (!post) {
        return res.status(404).json({ 
          success: false,
          error: 'Post not found' 
        });
      }
      
      // Ensure likes don't go below 0
      if (post.likes < 0) {
        await ImpactPost.findByIdAndUpdate(req.params.id, { likes: 0 });
        post.likes = 0;
      }
      
      res.json({ 
        success: true,
        message: 'Post unliked successfully', 
        data: { likes: post.likes }
      });
    } else {
      // Mock unlike
      const post = mockPosts.find(p => p._id === req.params.id);
      if (!post) {
        return res.status(404).json({ 
          success: false,
          error: 'Post not found' 
        });
      }
      
      post.likes = Math.max(0, (post.likes || 0) - 1);
      res.json({ 
        success: true,
        message: 'Post unliked successfully (mock mode)', 
        data: { likes: post.likes }
      });
    }
  } catch (error) {
    console.error('❌ Error unliking post:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to unlike post',
      details: error.message 
    });
  }
});

// ✅ GET posts by category
router.get('/category/:category', async (req, res) => {
  try {
    console.log('📂 GET /api/impact-posts/category/:category - Fetching posts for category:', req.params.category);
    
    if (ImpactPost) {
      const posts = await ImpactPost.find({ 
        category: req.params.category,
        status: { $in: ['active', 'completed'] }
      })
      .sort({ createdAt: -1 })
      .populate('authorId', 'name email');
      
      res.json({
        success: true,
        data: posts
      });
    } else {
      // Mock category filter
      const posts = mockPosts.filter(p => 
        p.category === req.params.category && 
        ['active', 'completed'].includes(p.status)
      );
      
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
      details: error.message 
    });
  }
});

// ✅ GET post statistics
router.get('/stats/summary', async (req, res) => {
  try {
    console.log('📊 GET /api/impact-posts/stats/summary - Fetching stats...');
    
    if (ImpactPost) {
      const totalPosts = await ImpactPost.countDocuments();
      const activePosts = await ImpactPost.countDocuments({ status: 'active' });
      const completedPosts = await ImpactPost.countDocuments({ status: 'completed' });
      
      const totalBeneficiaries = await ImpactPost.aggregate([
        { $group: { _id: null, total: { $sum: '$beneficiaries' } } }
      ]);
      
      const totalAmount = await ImpactPost.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      
      const categoryStats = await ImpactPost.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      
      res.json({
        success: true,
        data: {
          totalPosts,
          activePosts,
          completedPosts,
          totalBeneficiaries: totalBeneficiaries[0]?.total || 0,
          totalAmount: totalAmount[0]?.total || 0,
          categoryStats
        }
      });
    } else {
      // Mock stats
      const totalPosts = mockPosts.length;
      const activePosts = mockPosts.filter(p => p.status === 'active').length;
      const completedPosts = mockPosts.filter(p => p.status === 'completed').length;
      const totalBeneficiaries = mockPosts.reduce((sum, post) => sum + (post.beneficiaries || 0), 0);
      const totalAmount = mockPosts.reduce((sum, post) => sum + (post.amount || 0), 0);
      
      res.json({
        success: true,
        data: {
          totalPosts,
          activePosts,
          completedPosts,
          totalBeneficiaries,
          totalAmount,
          categoryStats: []
        }
      });
    }
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch statistics',
      details: error.message 
    });
  }
});

module.exports = router;
