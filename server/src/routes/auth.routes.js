const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

router.post('/register',
  [body('email').isEmail().normalizeEmail(),
   body('password').isLength({ min: 8 }),
   body('name').trim().notEmpty(),
   validate],
  authController.register
);

router.post('/login',
  [body('email').isEmail().normalizeEmail(),
   body('password').notEmpty(),
   validate],
  authController.login
);

router.post('/refresh', authController.refresh);
router.post('/logout',  authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
