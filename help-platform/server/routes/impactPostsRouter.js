const express = require('express');
const impactPostController = require('../controllers/impactposts');

const router = express.Router();

// IMPORTANT: Specific routes must come before parameterized routes
router.get('/stats/summary', impactPostController.getStatistics);
router.get('/category/:category', impactPostController.getPostsByCategory);
router.get('/', impactPostController.getAllPosts);
router.post('/', impactPostController.createPost);
router.get('/:id', impactPostController.getPostById);
router.put('/:id', impactPostController.updatePost);
router.delete('/:id', impactPostController.deletePost);
router.post('/:id/like', impactPostController.likePost);
router.delete('/:id/like', impactPostController.unlikePost);

module.exports = router;
