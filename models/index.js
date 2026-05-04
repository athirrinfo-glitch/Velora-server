const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// ===== المستخدم =====
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  email: { type: DataTypes.STRING(100), unique: true, allowNull: true },
  phone: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  password: { type: DataTypes.STRING(255), allowNull: true },
  fullName: { type: DataTypes.STRING(100), allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  avatar: { type: DataTypes.STRING(500), allowNull: true },
  coverImage: { type: DataTypes.STRING(500), allowNull: true },
  role: { type: DataTypes.ENUM('user', 'creator', 'admin'), defaultValue: 'user' },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  otp: { type: DataTypes.STRING(6), allowNull: true },
  otpExpiry: { type: DataTypes.DATE, allowNull: true },
  fcmToken: { type: DataTypes.STRING(500), allowNull: true },
  followersCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  followingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalLikes: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalViews: { type: DataTypes.BIGINT, defaultValue: 0 },
  language: { type: DataTypes.STRING(10), defaultValue: 'ar' },
  country: { type: DataTypes.STRING(50), allowNull: true },
  lastSeen: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'users' });

// ===== الفيديو =====
const Video = sequelize.define('Video', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('flash', 'wave'), defaultValue: 'flash' },
  title: { type: DataTypes.STRING(200), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  videoUrl: { type: DataTypes.STRING(500), allowNull: false },
  thumbnailUrl: { type: DataTypes.STRING(500), allowNull: true },
  duration: { type: DataTypes.FLOAT, allowNull: true },
  viewsCount: { type: DataTypes.BIGINT, defaultValue: 0 },
  likesCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  commentsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  sharesCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  savesCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
  allowComments: { type: DataTypes.BOOLEAN, defaultValue: true },
  allowDuet: { type: DataTypes.BOOLEAN, defaultValue: true },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  music: { type: DataTypes.JSON, allowNull: true },
  location: { type: DataTypes.STRING(200), allowNull: true },
  language: { type: DataTypes.STRING(10), defaultValue: 'ar' },
}, { tableName: 'videos' });

// ===== الستوري =====
const Story = sequelize.define('Story', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  mediaUrl: { type: DataTypes.STRING(500), allowNull: false },
  mediaType: { type: DataTypes.ENUM('image', 'video'), defaultValue: 'image' },
  duration: { type: DataTypes.INTEGER, defaultValue: 24 },
  viewsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'stories' });

// ===== المتابعات =====
const Follow = sequelize.define('Follow', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  followerId: { type: DataTypes.UUID, allowNull: false },
  followingId: { type: DataTypes.UUID, allowNull: false },
}, { tableName: 'follows' });

// ===== الإعجابات =====
const Like = sequelize.define('Like', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  videoId: { type: DataTypes.UUID, allowNull: false },
}, { tableName: 'likes' });

// ===== التعليقات =====
const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  videoId: { type: DataTypes.UUID, allowNull: false },
  parentId: { type: DataTypes.UUID, allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  likesCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'comments' });

// ===== المحادثات =====
const Chat = sequelize.define('Chat', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.ENUM('private', 'group'), defaultValue: 'private' },
  name: { type: DataTypes.STRING(100), allowNull: true },
  avatar: { type: DataTypes.STRING(500), allowNull: true },
  lastMessage: { type: DataTypes.TEXT, allowNull: true },
  lastMessageAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'chats' });

// ===== الرسائل =====
const Message = sequelize.define('Message', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  chatId: { type: DataTypes.UUID, allowNull: false },
  senderId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('text', 'image', 'video', 'voice', 'disappearing'), defaultValue: 'text' },
  content: { type: DataTypes.TEXT, allowNull: true },
  mediaUrl: { type: DataTypes.STRING(500), allowNull: true },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  expiresAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'messages' });

// ===== الإشعارات =====
const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  fromUserId: { type: DataTypes.UUID, allowNull: true },
  type: { type: DataTypes.ENUM('like', 'comment', 'follow', 'mention', 'live', 'system'), allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  data: { type: DataTypes.JSON, allowNull: true },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'notifications' });

// ===== العلاقات =====
User.hasMany(Video, { foreignKey: 'userId', as: 'videos' });
Video.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Story, { foreignKey: 'userId', as: 'stories' });
Story.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Video.hasMany(Like, { foreignKey: 'videoId', as: 'likes' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Video.hasMany(Comment, { foreignKey: 'videoId', as: 'comments' });

module.exports = { sequelize, User, Video, Story, Follow, Like, Comment, Chat, Message, Notification };

Follow.belongsTo(User, { foreignKey: 'followerId', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'followingId', as: 'following' });
