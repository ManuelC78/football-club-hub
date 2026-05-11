const SessionModel = require('../models/session.model');

exports.list = async (req, res, next) => {
  try {
    const { clubId } = req.query;
    if (!clubId) return res.status(400).json({ error: 'clubId query param required' });
    const sessions = await SessionModel.findByClub(clubId);
    res.json({ sessions });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const session = await SessionModel.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ session });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const session = await SessionModel.create({ ...req.body, coachId: req.user.id });
    res.status(201).json({ session });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const session = await SessionModel.update(req.params.id, req.body);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ session });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await SessionModel.delete(req.params.id);
    res.json({ message: 'Session deleted' });
  } catch (err) { next(err); }
};

exports.recordAttendance = async (req, res, next) => {
  try {
    const { attendance } = req.body;
    await SessionModel.upsertAttendance(req.params.id, attendance);
    const session = await SessionModel.findById(req.params.id);
    res.json({ session });
  } catch (err) { next(err); }
};
