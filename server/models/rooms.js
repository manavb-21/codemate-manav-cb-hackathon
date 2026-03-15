const mongoose = require('mongoose');
const RoomSchema = new mongoose.Schema({
  roomId:   { type: String, unique: true, required: true },
  name:     { type: String, default: 'Untitled Room' },
  language: { type: String, default: 'python' },
  code:     { type: String, default: '# Start coding here\n' },
  history:  [{ code: String, savedAt: Date, savedBy: String }],
  createdBy: String,
  participants: [{ userId: String, username: String, role: String }]
}, { timestamps: true });
module.exports = mongoose.model('Room', RoomSchema);