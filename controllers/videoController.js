const { Op } = require('sequelize');
const { Video, User, Like, Comment } = require('../models');

// رفع فيديو جديد
exports.uploadVideo = async (req, res) => {
  try {
    const { type, title, description, tags, language } = req.body;
    const userId = req.user.id;

    if (!req.file) return res.status(400).json({ success: false, message: 'الفيديو مطلوب' });

    const video = await Video.create({
      userId, type: type || 'flash', title, description,
      videoUrl: req.file.path,
      tags: tags ? JSON.parse(tags) : [],
      language: language || 'ar',
    });

    return res.status(201).json({ success: true, message: 'تم رفع الفيديو', data: { video } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// الفيد الرئيسي
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const videos = await Video.findAll({
      where: { isPublic: true },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar', 'isVerified'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.json({ success: true, data: { videos } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// تفاصيل فيديو
exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar', 'isVerified'] }],
    });

    if (!video) return res.status(404).json({ success: false, message: 'الفيديو غير موجود' });

    await video.increment('viewsCount');

    return res.json({ success: true, data: { video } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// لايك
exports.likeVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await Like.findOne({ where: { userId, videoId: id } });

    if (existing) {
      await existing.destroy();
      await Video.decrement('likesCount', { where: { id } });
      return res.json({ success: true, message: 'تم إلغاء الإعجاب', data: { liked: false } });
    }

    await Like.create({ userId, videoId: id });
    await Video.increment('likesCount', { where: { id } });

    return res.json({ success: true, message: 'تم الإعجاب', data: { liked: true } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// تعليق
exports.addComment = async (req, res) => {
  try {
    const { content, parentId } = req.body;
    const { id } = req.params;

    const comment = await Comment.create({
      userId: req.user.id, videoId: id, content, parentId: parentId || null,
    });

    await Video.increment('commentsCount', { where: { id } });

    return res.status(201).json({ success: true, message: 'تم التعليق', data: { comment } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// جلب التعليقات
exports.getComments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const comments = await Comment.findAll({
      where: { videoId: req.params.id, parentId: null, isActive: true },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.json({ success: true, data: { comments } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// حذف فيديو
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!video) return res.status(404).json({ success: false, message: 'الفيديو غير موجود' });

    await video.destroy();
    return res.json({ success: true, message: 'تم حذف الفيديو' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
