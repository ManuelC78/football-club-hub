const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const authController = require('../controllers/auth.controller');

// POST /api/auth/register
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    validate,
  ],
  authController.register
);

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate,
  ],
  authController.login
);

// POST /api/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;
