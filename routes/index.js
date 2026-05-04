const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const authCtrl = require('../controllers/authController');
const videoCtrl = require('../controllers/videoController');
const userCtrl = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// إعداد رفع الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.mimetype.startsWith('video') ? 'uploads/videos' : 'uploads/images';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

// ===== Auth =====
router.post('/auth/send-otp', authCtrl.sendOTP);
router.post('/auth/verify-otp', authCtrl.verifyOTP);
router.post('/auth/complete-profile', auth, authCtrl.completeProfile);
router.get('/auth/me', auth, authCtrl.getProfile);

// ===== Videos =====
router.post('/videos', auth, upload.single('video'), videoCtrl.uploadVideo);
router.get('/videos/feed', auth, videoCtrl.getFeed);
router.get('/videos/:id', videoCtrl.getVideo);
router.post('/videos/:id/like', auth, videoCtrl.likeVideo);
router.post('/videos/:id/comments', auth, videoCtrl.addComment);
router.get('/videos/:id/comments', videoCtrl.getComments);
router.delete('/videos/:id', auth, videoCtrl.deleteVideo);

// ===== Users =====
router.get('/users/search', auth, userCtrl.searchUsers);
router.get('/users/:username', userCtrl.getProfile);
router.put('/users/profile', auth, userCtrl.updateProfile);
router.post('/users/:userId/follow', auth, userCtrl.toggleFollow);
router.get('/users/:userId/followers', userCtrl.getFollowers);
router.get('/users/:userId/following', userCtrl.getFollowing);

module.exports = router;
