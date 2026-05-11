const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const clubController = require('../controllers/club.controller');

// GET    /api/clubs          — list clubs (admin)
// POST   /api/clubs          — create club
// GET    /api/clubs/:id      — get club
// PUT    /api/clubs/:id      — update club
// DELETE /api/clubs/:id      — delete club

router.get('/',      authenticate, authorize('admin'), clubController.list);
router.post('/',     authenticate, clubController.create);
router.get('/:id',   authenticate, clubController.get);
router.put('/:id',   authenticate, authorize('admin','manager'), clubController.update);
router.delete('/:id',authenticate, authorize('admin'), clubController.remove);

module.exports = router;
