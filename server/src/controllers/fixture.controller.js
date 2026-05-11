const { v4: uuidv4 } = require('uuid');

const fixtures = [];

exports.list   = (req, res) => {
  const { clubId, from, to } = req.query;
  let result = clubId ? fixtures.filter(f => f.homeClubId === clubId || f.awayClubId === clubId) : fixtures;
  if (from) result = result.filter(f => new Date(f.date) >= new Date(from));
  if (to)   result = result.filter(f => new Date(f.date) <= new Date(to));
  res.json({ fixtures: result });
};
exports.get    = (req, res) => {
  const fixture = fixtures.find(f => f.id === req.params.id);
  if (!fixture) return res.status(404).json({ error: 'Fixture not found' });
  res.json({ fixture });
};
exports.create = (req, res) => {
  const fixture = { id: uuidv4(), ...req.body, result: null, createdAt: new Date() };
  fixtures.push(fixture);
  res.status(201).json({ fixture });
};
exports.update = (req, res) => {
  const idx = fixtures.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Fixture not found' });
  fixtures[idx] = { ...fixtures[idx], ...req.body, updatedAt: new Date() };
  res.json({ fixture: fixtures[idx] });
};
exports.remove = (req, res) => {
  const idx = fixtures.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Fixture not found' });
  fixtures.splice(idx, 1);
  res.json({ message: 'Fixture deleted' });
};
exports.recordResult = (req, res) => {
  const fixture = fixtures.find(f => f.id === req.params.id);
  if (!fixture) return res.status(404).json({ error: 'Fixture not found' });
  fixture.result = req.body; // { homeScore, awayScore, notes }
  fixture.updatedAt = new Date();
  res.json({ fixture });
};
