const { v4: uuidv4 } = require('uuid');

const players = [];

exports.list   = (req, res) => {
  const { clubId, teamId } = req.query;
  let result = players;
  if (clubId)  result = result.filter(p => p.clubId === clubId);
  if (teamId)  result = result.filter(p => p.teamId === teamId);
  res.json({ players: result });
};
exports.get    = (req, res) => {
  const player = players.find(p => p.id === req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  res.json({ player });
};
exports.create = (req, res) => {
  const player = { id: uuidv4(), ...req.body, createdAt: new Date() };
  players.push(player);
  res.status(201).json({ player });
};
exports.update = (req, res) => {
  const idx = players.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Player not found' });
  players[idx] = { ...players[idx], ...req.body, updatedAt: new Date() };
  res.json({ player: players[idx] });
};
exports.remove = (req, res) => {
  const idx = players.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Player not found' });
  players.splice(idx, 1);
  res.json({ message: 'Player deleted' });
};
