const express = require('express');
const router = express.Router();
const ImpactPost = require('../models/ImpactPost');

// GET all posts with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, category, status, author } = req.query;
    
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
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST a new post
router.post('/', async (req, res) => {
  try {
    const { title, category, beneficiaries, amount, details, authorId, authorName } = req.body;

    if (!title || !category || !details) {
      return res.status(400).json({ error: 'Missing required fields: title, category, details' });
    }

    const newPost = new ImpactPost({
      title,
      category,
      beneficiaries: beneficiaries || 0,
      amount: amount || 0,
      details,
      authorId: authorId || null,
      authorName: authorName || 'Anonymous'
    });

    const savedPost = await newPost.save();
    await savedPost.populate('authorId', 'name email');
    
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post', details: error.message });
  }
});

// GET single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await ImpactPost.findById(req.params.id)
      .populate('authorId', 'name email');
      
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Increment view count
    await ImpactPost.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// PUT update post
router.put('/:id', async (req, res) => {
  try {
    const updatedPost = await ImpactPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('authorId', 'name email');
    
    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE post
router.delete('/:id', async (req, res) => {
  try {
    const deletedPost = await ImpactPost.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// POST like a post
router.post('/:id/like', async (req, res) => {
  try {
    const post = await ImpactPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'Post liked successfully', likes: post.likes });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// DELETE unlike a post
router.delete('/:id/like', async (req, res) => {
  try {
    const post = await ImpactPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: -1 } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'Post unliked successfully', likes: Math.max(0, post.likes) });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

// PUT increment views
router.put('/:id/views', async (req, res) => {
  try {
    const post = await ImpactPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'View count updated', views: post.views });
  } catch (error) {
    console.error('Error updating views:', error);
    res.status(500).json({ error: 'Failed to update views' });
  }
});

// GET posts by category
router.get('/category/:category', async (req, res) => {
  try {
    const posts = await ImpactPost.find({ 
      category: req.params.category,
      status: { $in: ['active', 'completed'] }
    })
    .sort({ createdAt: -1 })
    .populate('authorId', 'name email');
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    res.status(500).json({ error: 'Failed to fetch posts by category' });
  }
});

// GET posts by author
router.get('/author/:authorId', async (req, res) => {
  try {
    const posts = await ImpactPost.find({ 
      authorId: req.params.authorId,
      status: { $in: ['active', 'completed'] }
    })
    .sort({ createdAt: -1 })
    .populate('authorId', 'name email');
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts by author:', error);
    res.status(500).json({ error: 'Failed to fetch posts by author' });
  }
});

// GET posts by status
router.get('/status/:status', async (req, res) => {
  try {
    const posts = await ImpactPost.find({ status: req.params.status })
      .sort({ createdAt: -1 })
      .populate('authorId', 'name email');
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts by status:', error);
    res.status(500).json({ error: 'Failed to fetch posts by status' });
  }
});

// GET search posts
router.get('/search', async (req, res) => {
  try {
    const { q, category, status } = req.query;
    
    let query = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { details: { $regex: q, $options: 'i' } }
      ]
    };
    
    if (category) query.category = category;
    if (status) query.status = status;
    else query.status = { $in: ['active', 'completed'] };
    
    const posts = await ImpactPost.find(query)
      .sort({ createdAt: -1 })
      .populate('authorId', 'name email');
    
    res.json(posts);
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ error: 'Failed to search posts' });
  }
});

// GET post statistics
router.get('/stats', async (req, res) => {
  try {
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
      totalPosts,
      activePosts,
      completedPosts,
      totalBeneficiaries: totalBeneficiaries[0]?.total || 0,
      totalAmount: totalAmount[0]?.total || 0,
      categoryStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// PUT verify post (admin)
router.put('/:id/verify', async (req, res) => {
  try {
    const post = await ImpactPost.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'Post verified successfully', post });
  } catch (error) {
    console.error('Error verifying post:', error);
    res.status(500).json({ error: 'Failed to verify post' });
  }
});

// PUT unverify post (admin)
router.put('/:id/unverify', async (req, res) => {
  try {
    const post = await ImpactPost.findByIdAndUpdate(
      req.params.id,
      { isVerified: false },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'Post unverified successfully', post });
  } catch (error) {
    console.error('Error unverifying post:', error);
    res.status(500).json({ error: 'Failed to unverify post' });
  }
});

// PUT moderate post (admin)
router.put('/:id/moderate', async (req, res) => {
  try {
    const { action, reason } = req.body;
    
    let updateData = {};
    switch (action) {
      case 'approve':
        updateData = { status: 'active', isVerified: true };
        break;
      case 'reject':
        updateData = { status: 'archived' };
        break;
      case 'hide':
        updateData = { status: 'pending' };
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    const post = await ImpactPost.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: `Post ${action}ed successfully`, post });
  } catch (error) {
    console.error('Error moderating post:', error);
    res.status(500).json({ error: 'Failed to moderate post' });
  }
});

module.exports = router;
