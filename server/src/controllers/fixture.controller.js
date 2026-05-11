const FixtureModel = require('../models/fixture.model');

exports.list = async (req, res, next) => {
  try {
    const { clubId, from, to } = req.query;
    if (!clubId) return res.status(400).json({ error: 'clubId query param required' });
    const fixtures = await FixtureModel.findByClub(clubId, { from, to });
    res.json({ fixtures });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const fixture = await FixtureModel.findById(req.params.id);
    if (!fixture) return res.status(404).json({ error: 'Fixture not found' });
    res.json({ fixture });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const fixture = await FixtureModel.create(req.body);
    res.status(201).json({ fixture });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const fixture = await FixtureModel.update(req.params.id, req.body);
    if (!fixture) return res.status(404).json({ error: 'Fixture not found' });
    res.json({ fixture });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await FixtureModel.delete(req.params.id);
    res.json({ message: 'Fixture deleted' });
  } catch (err) { next(err); }
};

exports.recordResult = async (req, res, next) => {
  try {
    const fixture = await FixtureModel.recordResult(req.params.id, req.body);
    if (!fixture) return res.status(404).json({ error: 'Fixture not found' });
    res.json({ fixture });
  } catch (err) { next(err); }
};
