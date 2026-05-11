const PlayerModel = require('../models/player.model');

exports.list = async (req, res, next) => {
  try {
    const { clubId } = req.query;
    if (!clubId) return res.status(400).json({ error: 'clubId query param required' });
    const players = await PlayerModel.findByClub(clubId);
    res.json({ players });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const player = await PlayerModel.findById(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json({ player });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const player = await PlayerModel.create(req.body);
    res.status(201).json({ player });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const player = await PlayerModel.update(req.params.id, req.body);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json({ player });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await PlayerModel.delete(req.params.id);
    res.json({ message: 'Player removed from squad' });
  } catch (err) { next(err); }
};
