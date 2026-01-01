const impactPostService = require('../services/impactposts');

const impactPostController = {
  async getAllPosts(req, res) {
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
      
      const result = await impactPostService.getAllPosts({
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        status,
        author,
        search,
        sortBy,
        sortOrder
      });
      
      console.log('📤 Sending response with', result.data.posts.length, 'posts');
      res.json(result);
      
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
  },

  async createPost(req, res) {
    try {
      console.log('📝 POST /api/impact-posts - Creating new post');
      console.log('📝 Request body:', req.body);
      
      const newPost = await impactPostService.createPost(req.body);
      
      console.log('✅ Post created successfully with ID:', newPost._id);
      
      res.status(201).json({
        success: true,
        data: newPost,
        message: 'Impact post created successfully'
      });
      
    } catch (error) {
      console.error('❌ Error creating impact post:', error);
      console.error('Stack trace:', error.stack);
      
      if (error.statusCode === 400) {
        return res.status(400).json({
          success: false,
          error: error.message,
          details: error.details
        });
      }
      
      res.status(500).json({ 
        success: false,
        error: 'Failed to create impact post', 
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  async getPostById(req, res) {
    try {
      console.log('📖 GET /api/impact-posts/:id - Fetching post:', req.params.id);
      
      const post = await impactPostService.getPostById(req.params.id);
      
      res.json({
        success: true,
        data: post
      });
      
    } catch (error) {
      console.error('❌ Error fetching impact post:', error);
      
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch impact post',
        details: error.message 
      });
    }
  },

  async updatePost(req, res) {
    try {
      console.log('✏️ PUT /api/impact-posts/:id - Updating post:', req.params.id);
      console.log('✏️ Update data:', req.body);
      
      const updatedPost = await impactPostService.updatePost(req.params.id, req.body);
      
      res.json({
        success: true,
        data: updatedPost,
        message: 'Impact post updated successfully'
      });
      
    } catch (error) {
      console.error('❌ Error updating impact post:', error);
      
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({ 
        success: false,
        error: 'Failed to update impact post',
        details: error.message 
      });
    }
  },

  async deletePost(req, res) {
    try {
      console.log('🗑️ DELETE /api/impact-posts/:id - Deleting post:', req.params.id);
      
      await impactPostService.deletePost(req.params.id);
      
      res.json({ 
        success: true,
        message: 'Impact post deleted successfully' 
      });
      
    } catch (error) {
      console.error('❌ Error deleting impact post:', error);
      
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete impact post',
        details: error.message 
      });
    }
  },

  async likePost(req, res) {
    try {
      console.log('👍 POST /api/impact-posts/:id/like - Liking post:', req.params.id);
      
      const likes = await impactPostService.likePost(req.params.id);
      
      res.json({ 
        success: true,
        message: 'Post liked successfully', 
        data: { likes }
      });
      
    } catch (error) {
      console.error('❌ Error liking impact post:', error);
      
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({ 
        success: false,
        error: 'Failed to like post',
        details: error.message 
      });
    }
  },

  async unlikePost(req, res) {
    try {
      console.log('👎 DELETE /api/impact-posts/:id/like - Unliking post:', req.params.id);
      
      const likes = await impactPostService.unlikePost(req.params.id);
      
      res.json({ 
        success: true,
        message: 'Post unliked successfully', 
        data: { likes }
      });
      
    } catch (error) {
      console.error('❌ Error unliking impact post:', error);
      
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({ 
        success: false,
        error: 'Failed to unlike post',
        details: error.message 
      });
    }
  },

  async getPostsByCategory(req, res) {
    try {
      console.log('📂 GET /api/impact-posts/category/:category - Fetching posts for category:', req.params.category);
      
      const posts = await impactPostService.getPostsByCategory(req.params.category);
      
      res.json({
        success: true,
        data: posts || []
      });
      
    } catch (error) {
      console.error('❌ Error fetching posts by category:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch posts by category',
        details: error.message,
        data: []
      });
    }
  },

  async getStatistics(req, res) {
    try {
      console.log('📊 GET /api/impact-posts/stats/summary - Fetching statistics...');
      
      const stats = await impactPostService.getStatistics();
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch statistics',
        details: error.message 
      });
    }
  }
};

module.exports = impactPostController;
