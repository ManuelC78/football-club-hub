const { getFileUrl } = require('../middleware/upload.middleware');
const { query } = require('../db/pool');

// POST /api/upload/avatar/:playerId
exports.playerAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = getFileUrl(req.file);
    await query('UPDATE players SET avatar_url = $1 WHERE id = $2', [url, req.params.playerId]);
    res.json({ url });
  } catch (err) { next(err); }
};

// POST /api/upload/logo/:clubId
exports.clubLogo = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = getFileUrl(req.file);
    await query('UPDATE clubs SET logo_url = $1 WHERE id = $2', [url, req.params.clubId]);
    res.json({ url });
  } catch (err) { next(err); }
};

// POST /api/upload/user-avatar
exports.userAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = getFileUrl(req.file);
    await query('UPDATE users SET avatar_url = $1 WHERE id = $2', [url, req.user.id]);
    res.json({ url });
  } catch (err) { next(err); }
};
