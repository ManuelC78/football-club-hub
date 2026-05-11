const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const sessionController = require('../controllers/session.controller');

// Training sessions
router.get('/',       authenticate, sessionController.list);
router.post('/',      authenticate, authorize('admin','manager','coach'), sessionController.create);
router.get('/:id',    authenticate, sessionController.get);
router.put('/:id',    authenticate, authorize('admin','manager','coach'), sessionController.update);
router.delete('/:id', authenticate, authorize('admin','manager'), sessionController.remove);

// Attendance
router.post('/:id/attendance', authenticate, authorize('coach','manager'), sessionController.recordAttendance);

module.exports = router;
