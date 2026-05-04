const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// إرسال OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ where: { phone } });
    if (!user) {
      user = await User.create({ phone, otp, otpExpiry, username: `user_${Date.now()}` });
    } else {
      await user.update({ otp, otpExpiry });
    }

    console.log(`📱 OTP لـ ${phone}: ${otp}`);

    return res.json({ success: true, message: 'تم إرسال الرمز', data: { phone } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// التحقق من OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ where: { phone } });

    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'رمز خاطئ' });
    if (new Date() > user.otpExpiry) return res.status(400).json({ success: false, message: 'الرمز منتهي' });

    const isNew = !user.isVerified;
    await user.update({ isVerified: true, otp: null, otpExpiry: null, lastSeen: new Date() });

    const token = generateToken(user.id);

    return res.json({
      success: true,
      message: 'تم تسجيل الدخول',
      data: { token, user: { id: user.id, phone: user.phone, username: user.username, avatar: user.avatar, isNew } }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// إكمال الملف الشخصي
exports.completeProfile = async (req, res) => {
  try {
    const { username, fullName, language, country } = req.body;

    const exists = await User.findOne({ where: { username } });
    if (exists && exists.id !== req.user.id) {
      return res.status(400).json({ success: false, message: 'اسم المستخدم محجوز' });
    }

    await req.user.update({ username, fullName, language, country });

    return res.json({ success: true, message: 'تم تحديث الملف', data: { user: req.user } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// الملف الشخصي
exports.getProfile = async (req, res) => {
  try {
    return res.json({ success: true, data: { user: req.user } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
