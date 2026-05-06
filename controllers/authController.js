const jwt = require('jsonwebtoken');
const { User } = require('../models');
const twilio = require('twilio');

const getVerifyClient = () => {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  ).verify.v2.services(process.env.TWILIO_VERIFY_SID);
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// إرسال OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone)
      return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });

    await getVerifyClient().verifications.create({
      to: phone,
      channel: 'sms',
    });

    let user = await User.findOne({ where: { phone } });
    if (!user) {
      user = await User.create({
        phone,
        username: `user_${Date.now()}`,
      });
    }

    return res.json({
      success: true,
      message: 'تم إرسال الرمز',
      data: { phone },
    });
  } catch (err) {
    console.error('sendOTP error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// التحقق من OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const result = await getVerifyClient().verificationChecks.create({
      to: phone,
      code: otp,
    });

    if (result.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'رمز خاطئ' });
    }

    let user = await User.findOne({ where: { phone } });
    if (!user) {
      user = await User.create({
        phone,
        username: `user_${Date.now()}`,
        isVerified: true,
      });
    } else {
      await user.update({ isVerified: true, lastSeen: new Date() });
    }

    const isNew = !user.fullName;
    const token = generateToken(user.id);

    return res.json({
      success: true,
      message: 'تم تسجيل الدخول',
      token,
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          username: user.username,
          avatar: user.avatar,
          isNew,
        },
      },
    });
  } catch (err) {
    console.error('verifyOTP error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// إكمال الملف الشخصي
exports.completeProfile = async (req, res) => {
  try {
    const { username, fullName, language, country, interests } = req.body;

    if (username) {
      const exists = await User.findOne({ where: { username } });
      if (exists && exists.id !== req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'اسم المستخدم محجوز',
        });
      }
    }

    await req.user.update({ username, fullName, language, country, interests });

    return res.json({
      success: true,
      message: 'تم تحديث الملف',
      data: { user: req.user },
    });
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
