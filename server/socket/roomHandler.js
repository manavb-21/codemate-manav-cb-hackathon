const Room = require('../models/Room');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room
    socket.on('join-room', async ({ roomId, user }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.user = user;
      
      const room = await Room.findOne({ roomId });
      if (room) {
        socket.emit('load-code', { code: room.code, language: room.language });
      }
      socket.to(roomId).emit('user-joined', { user });
    });

    // Real-time code sync
    socket.on('code-change', async ({ roomId, code }) => {
      socket.to(roomId).emit('code-update', { code });
      // Debounced DB save (save every 5s)
      await Room.findOneAndUpdate({ roomId }, { code });
    });

    // Language change
    socket.on('language-change', ({ roomId, language }) => {
      io.to(roomId).emit('language-update', { language });
    });

    // Chat message
    socket.on('chat-message', ({ roomId, message, user }) => {
      io.to(roomId).emit('new-message', { message, user, time: new Date() });
    });

    // Run code consensus (all collaborators must tick)
    socket.on('run-vote', ({ roomId, userId }) => {
      io.to(roomId).emit('run-vote-update', { userId });
    });

    socket.on('run-execute', ({ roomId }) => {
      io.to(roomId).emit('execution-started');
    });

    // Raise hand
    socket.on('raise-hand', ({ roomId, user }) => {
      io.to(roomId).emit('hand-raised', { user });
    });

    socket.on('disconnect', () => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit('user-left', { user: socket.user });
      }
    });
  });
};