const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const playerController = require('../controllers/player.controller');

router.get('/',       authenticate, playerController.list);
router.post('/',      authenticate, authorize('admin','manager','coach'), playerController.create);
router.get('/:id',    authenticate, playerController.get);
router.put('/:id',    authenticate, authorize('admin','manager','coach'), playerController.update);
router.delete('/:id', authenticate, authorize('admin','manager'), playerController.remove);

module.exports = router;
