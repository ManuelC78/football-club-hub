const { v4: uuidv4 } = require('uuid');

// Stubbed in-memory store — replace with DB queries
const clubs = [];

exports.list   = (req, res) => res.json({ clubs });
exports.get    = (req, res) => {
  const club = clubs.find(c => c.id === req.params.id);
  if (!club) return res.status(404).json({ error: 'Club not found' });
  res.json({ club });
};
exports.create = (req, res) => {
  const club = { id: uuidv4(), ...req.body, createdBy: req.user.id, createdAt: new Date() };
  clubs.push(club);
  res.status(201).json({ club });
};
exports.update = (req, res) => {
  const idx = clubs.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Club not found' });
  clubs[idx] = { ...clubs[idx], ...req.body, updatedAt: new Date() };
  res.json({ club: clubs[idx] });
};
exports.remove = (req, res) => {
  const idx = clubs.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Club not found' });
  clubs.splice(idx, 1);
  res.json({ message: 'Club deleted' });
};
