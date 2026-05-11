const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const uploadController = require('../controllers/upload.controller');

// Inject upload folder into request before multer runs
const setFolder = (folder) => (req, _res, next) => { req.uploadFolder = folder; next(); };

router.post('/avatar/:playerId',
  authenticate, authorize('admin','manager','coach'),
  setFolder('players'),
  upload.single('avatar'),
  uploadController.playerAvatar
);

router.post('/logo/:clubId',
  authenticate, authorize('admin','manager'),
  setFolder('clubs'),
  upload.single('logo'),
  uploadController.clubLogo
);

router.post('/user-avatar',
  authenticate,
  setFolder('users'),
  upload.single('avatar'),
  uploadController.userAvatar
);

module.exports = router;
