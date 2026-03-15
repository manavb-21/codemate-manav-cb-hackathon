const router  = require('express').Router();
const Room    = require('../models/rooms');
const auth    = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Install uuid: cd server && npm install uuid

router.post('/create', auth, async (req, res) => {
  try {
    const roomId = uuidv4().slice(0, 8).toUpperCase();
    const room = await Room.create({ roomId, name: req.body.name || 'New Room', createdBy: req.user.username });
    res.json({ roomId: room.roomId, name: room.name });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/:roomId/save', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      { code, $push: { history: { code, savedAt: new Date(), savedBy: req.user.username } } },
      { new: true }
    );
    res.json({ message: 'Saved', room });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;