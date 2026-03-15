const mongoose = require('mongoose');
const RoomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true },
  name: String,
  language: { type: String, default: 'python' },
  code: { type: String, default: '# Start coding here\n' },
  history: [{ code: String, savedAt: Date, savedBy: String }],
  participants: [{ userId: String, role: { type: String, enum: ['student','ta','teacher'] } }],
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Room', RoomSchema);