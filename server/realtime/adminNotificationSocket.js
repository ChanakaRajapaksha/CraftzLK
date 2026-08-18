const { Server } = require('socket.io');
const { verifyAccessToken } = require('../config/jwt');
const User = require('../models/user');

const ADMIN_ROOM = 'admin-notifications';

let io = null;

function initAdminNotificationSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
    path: '/socket.io',
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Unauthorized'));
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user || !user.isActive || user.role !== 'admin') {
        return next(new Error('Unauthorized'));
      }

      socket.user = user;
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(ADMIN_ROOM);
  });

  return io;
}

function emitAdminNotification(payload) {
  if (!io) return;
  io.to(ADMIN_ROOM).emit('admin:notification:new', payload);
}

module.exports = {
  initAdminNotificationSocket,
  emitAdminNotification,
};
