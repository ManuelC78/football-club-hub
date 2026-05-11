const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const fixtureController = require('../controllers/fixture.controller');

router.get('/',       authenticate, fixtureController.list);
router.post('/',      authenticate, authorize('admin','manager'), fixtureController.create);
router.get('/:id',    authenticate, fixtureController.get);
router.put('/:id',    authenticate, authorize('admin','manager'), fixtureController.update);
router.delete('/:id', authenticate, authorize('admin','manager'), fixtureController.remove);

// Record result
router.post('/:id/result', authenticate, authorize('admin','manager'), fixtureController.recordResult);

module.exports = router;
