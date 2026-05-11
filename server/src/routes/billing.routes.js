const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const billingController = require('../controllers/billing.controller');

// Webhook must use raw body — registered before JSON middleware in app.js
router.post('/webhook', express.raw({ type: 'application/json' }), billingController.handleWebhook);

router.get('/:clubId',    authenticate, billingController.getSubscription);
router.post('/checkout',  authenticate, authorize('admin','manager'), billingController.createCheckout);
router.post('/portal',    authenticate, authorize('admin','manager'), billingController.createPortal);

module.exports = router;
