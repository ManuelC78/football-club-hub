const { v4: uuidv4 } = require('uuid');

const sessions = [];

exports.list   = (req, res) => {
  const { clubId } = req.query;
  const result = clubId ? sessions.filter(s => s.clubId === clubId) : sessions;
  res.json({ sessions: result });
};
exports.get    = (req, res) => {
  const session = sessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json({ session });
};
exports.create = (req, res) => {
  const session = {
    id: uuidv4(),
    ...req.body,
    attendance: [],
    coachId: req.user.id,
    createdAt: new Date(),
  };
  sessions.push(session);
  res.status(201).json({ session });
};
exports.update = (req, res) => {
  const idx = sessions.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Session not found' });
  sessions[idx] = { ...sessions[idx], ...req.body, updatedAt: new Date() };
  res.json({ session: sessions[idx] });
};
exports.remove = (req, res) => {
  const idx = sessions.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Session not found' });
  sessions.splice(idx, 1);
  res.json({ message: 'Session deleted' });
};
exports.recordAttendance = (req, res) => {
  const session = sessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  session.attendance = req.body.attendance; // [{ playerId, present }]
  session.updatedAt = new Date();
  res.json({ session });
};
