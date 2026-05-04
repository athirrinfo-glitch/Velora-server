const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'غير مصرح' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'الحساب غير موجود' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'رمز التحقق غير صالح' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'للمدير فقط' });
  }
  next();
};

const creatorOnly = (req, res, next) => {
  if (!['creator', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'للـ Creator فقط' });
  }
  next();
};

module.exports = { auth, adminOnly, creatorOnly };
