const Room = require('../models/rooms');

const activeRooms = new Map(); // track live rooms

module.exports = (io) => {
  io.on('connection', (socket) => {

    socket.on('join-room', async ({ roomId, user }) => {
    // Leave previous room if reconnecting
    if (socket.roomId) {
        socket.leave(socket.roomId);
    }
    
    socket.join(roomId);
    socket.roomId = roomId;
    socket.user = user;

    if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, { roomId, participants: [], createdAt: new Date() });
    }
    const room = activeRooms.get(roomId);
    // prevent duplicate participants
    room.participants = room.participants.filter(p => p.id !== user.id);
    room.participants.push(user);
    // rest stays same...

      const dbRoom = await Room.findOne({ roomId });
      if (dbRoom) socket.emit('load-room', { code: dbRoom.code, language: dbRoom.language });
      socket.to(roomId).emit('user-joined', { user });
      console.log(`${user?.username} joined ${roomId}`);

      // broadcast updated active rooms to all TAs/teachers
      io.emit('active-rooms-update', Array.from(activeRooms.values()));
    });

    socket.on('code-change', async ({ roomId, code }) => {
      socket.to(roomId).emit('code-update', { code });
      if (activeRooms.has(roomId)) {
        activeRooms.get(roomId).lastCode = code;
      }
      await Room.findOneAndUpdate({ roomId }, { code });
    });

    socket.on('language-change', ({ roomId, language }) => {
      io.to(roomId).emit('language-update', { language });
    });

    socket.on('chat-message', ({ roomId, message, user }) => {
      io.to(roomId).emit('new-message', { message, user, time: new Date().toLocaleTimeString() });
    });

    socket.on('raise-hand', ({ roomId, user }) => {
      socket.to(roomId).emit('hand-raised', { user });
      // notify all TAs
      io.emit('student-needs-help', { user, roomId, time: new Date().toLocaleTimeString() });
    });

    socket.on('unlock-editing', ({ roomId }) => {
      io.to(roomId).emit('editing-unlocked');
    });

    socket.on('request-active-rooms', () => {
      socket.emit('active-rooms-update', Array.from(activeRooms.values()));
    });

    socket.on('disconnect', () => {
      if (socket.roomId && socket.user) {
        socket.to(socket.roomId).emit('user-left', { user: socket.user });
        if (activeRooms.has(socket.roomId)) {
          const room = activeRooms.get(socket.roomId);
          room.participants = room.participants.filter(p => p.id !== socket.user.id);
          if (room.participants.length === 0) activeRooms.delete(socket.roomId);
          io.emit('active-rooms-update', Array.from(activeRooms.values()));
        }
      }
    });
  });
};