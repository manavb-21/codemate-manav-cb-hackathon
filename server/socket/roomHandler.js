const Room = require('../models/rooms');

module.exports = (io) => {
  io.on('connection', (socket) => {

    socket.on('join-room', async ({ roomId, user }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.user = user;
      const room = await Room.findOne({ roomId });
      if (room) socket.emit('load-room', { code: room.code, language: room.language });
      socket.to(roomId).emit('user-joined', { user });
      console.log(`${user?.username} joined ${roomId}`);
    });

    socket.on('code-change', async ({ roomId, code }) => {
      socket.to(roomId).emit('code-update', { code });
      await Room.findOneAndUpdate({ roomId }, { code }); // auto-save
    });

    socket.on('language-change', ({ roomId, language }) => {
      io.to(roomId).emit('language-update', { language });
    });

    socket.on('chat-message', ({ roomId, message, user }) => {
      io.to(roomId).emit('new-message', { message, user, time: new Date().toLocaleTimeString() });
    });

    socket.on('raise-hand', ({ roomId, user }) => {
      socket.to(roomId).emit('hand-raised', { user });
    });

    socket.on('disconnect', () => {
      if (socket.roomId && socket.user) {
        socket.to(socket.roomId).emit('user-left', { user: socket.user });
      }
    });
  });
};