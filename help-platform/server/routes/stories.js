const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const storyController = require('../controllers/stories');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'stories');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('✅ Created stories upload directory:', uploadPath);
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'story-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📁 Generated filename:', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('🔍 Checking file type:', file.mimetype);
  
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

// Routes
router.get('/inspiring-stories', storyController.getInspiringStories);
router.get('/stats', storyController.getStats);
router.get('/', storyController.getAllStories);
router.post('/submit', upload.single('image'), storyController.submitStory);
router.post('/submit-story', upload.single('image'), storyController.submitStory);
router.get('/:id', storyController.getStoryById);

module.exports = router;
