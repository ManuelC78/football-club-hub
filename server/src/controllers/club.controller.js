const ClubModel = require('../models/club.model');

exports.list = async (req, res, next) => {
  try {
    const clubs = req.user.role === 'admin'
      ? await ClubModel.findAll()
      : await ClubModel.findByOwner(req.user.id);
    res.json({ clubs });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const club = await ClubModel.findById(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    res.json({ club });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const club = await ClubModel.create({ ...req.body, ownerId: req.user.id });
    res.status(201).json({ club });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const club = await ClubModel.update(req.params.id, req.body);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    res.json({ club });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await ClubModel.delete(req.params.id);
    res.json({ message: 'Club deleted' });
  } catch (err) { next(err); }
};
