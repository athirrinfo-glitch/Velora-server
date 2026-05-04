const { Op } = require('sequelize');
const { User, Video, Follow } = require('../models');

// بروفايل مستخدم
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      attributes: { exclude: ['otp', 'otpExpiry', 'fcmToken'] },
    });

    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

    const isFollowing = req.user ? await Follow.findOne({
      where: { followerId: req.user.id, followingId: user.id }
    }) : false;

    return res.json({ success: true, data: { user, isFollowing: !!isFollowing } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// متابعة/إلغاء متابعة
exports.toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    if (followerId === userId) {
      return res.status(400).json({ success: false, message: 'لا تستطيع متابعة نفسك' });
    }

    const existing = await Follow.findOne({ where: { followerId, followingId: userId } });

    if (existing) {
      await existing.destroy();
      await User.decrement('followersCount', { where: { id: userId } });
      await User.decrement('followingCount', { where: { id: followerId } });
      return res.json({ success: true, message: 'تم إلغاء المتابعة', data: { following: false } });
    }

    await Follow.create({ followerId, followingId: userId });
    await User.increment('followersCount', { where: { id: userId } });
    await User.increment('followingCount', { where: { id: followerId } });

    return res.json({ success: true, message: 'تم المتابعة', data: { following: true } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// البحث عن مستخدمين
exports.searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'كلمة البحث مطلوبة' });

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${q}%` } },
          { fullName: { [Op.iLike]: `%${q}%` } },
        ],
        isActive: true,
      },
      attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'followersCount'],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });

    return res.json({ success: true, data: { users } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// تحديث الملف الشخصي
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio, language, country } = req.body;
    await req.user.update({ fullName, bio, language, country });
    return res.json({ success: true, message: 'تم التحديث', data: { user: req.user } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// المتابعون
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.findAll({
      where: { followingId: userId },
      include: [{ model: User, as: 'follower', attributes: ['id', 'username', 'avatar', 'isVerified'] }],
    });
    return res.json({ success: true, data: { followers: follows.map(f => f.follower) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// المتابَعون
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.findAll({
      where: { followerId: userId },
      include: [{ model: User, as: 'following', attributes: ['id', 'username', 'avatar', 'isVerified'] }],
    });
    return res.json({ success: true, data: { following: follows.map(f => f.following) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
