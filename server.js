require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { connectDB } = require('./config/database');
const routes = require('./routes');

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// المستخدمون المتصلون
const connectedUsers = new Map();

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.join(`user_${userId}`);
  });

  socket.on('send_message', (data) => {
    io.to(`user_${data.receiverId}`).emit('new_message', data);
  });

  socket.on('disconnect', () => {
    for (const [id, sid] of connectedUsers.entries()) {
      if (sid === socket.id) connectedUsers.delete(id);
    }
  });
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'طلبات كثيرة، حاول بعد قليل' }
}));

// المسارات
app.get('/', (req, res) => res.json({
  success: true,
  message: '🌊 Velora API - يعمل بنجاح!',
  version: '1.0.0'
}));

app.get('/health', (req, res) => res.json({
  success: true,
  status: 'healthy',
  uptime: process.uptime()
}));

app.use('/api', routes);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'المسار غير موجود' }));

// أخطاء عامة
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'خطأ في الخادم' });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`\n🌊 Velora Server يعمل على المنفذ ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}\n`);
  });
};

start();

module.exports = { app, io, connectedUsers };
