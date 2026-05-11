const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const SubscriptionModel = require('../models/subscription.model');

// Pricing — map plan names to Stripe Price IDs (set in env)
const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro:     process.env.STRIPE_PRICE_PRO,
  elite:   process.env.STRIPE_PRICE_ELITE,
};

// GET /api/billing/:clubId — get current subscription
exports.getSubscription = async (req, res, next) => {
  try {
    const sub = await SubscriptionModel.findByClub(req.params.clubId);
    res.json({ subscription: sub || { plan: 'free', status: 'active' } });
  } catch (err) { next(err); }
};

// POST /api/billing/checkout — create Stripe Checkout session
exports.createCheckout = async (req, res, next) => {
  try {
    const { clubId, plan, successUrl, cancelUrl } = req.body;
    if (!PRICE_IDS[plan]) return res.status(400).json({ error: `Invalid plan: ${plan}` });

    // Get or create Stripe customer
    let stripeCustomerId;
    const existing = await SubscriptionModel.findByClub(clubId);
    if (existing?.stripe_customer_id) {
      stripeCustomerId = existing.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: { clubId, userId: req.user.id },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: successUrl || `${process.env.CLIENT_URL}/dashboard/billing?success=1`,
      cancel_url:  cancelUrl  || `${process.env.CLIENT_URL}/dashboard/billing?canceled=1`,
      subscription_data: {
        metadata: { clubId, plan },
        trial_period_days: 14,
      },
      metadata: { clubId, plan },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) { next(err); }
};

// POST /api/billing/portal — customer billing portal
exports.createPortal = async (req, res, next) => {
  try {
    const { clubId } = req.body;
    const sub = await SubscriptionModel.findByClub(clubId);
    if (!sub?.stripe_customer_id) {
      return res.status(404).json({ error: 'No billing account found' });
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.CLIENT_URL}/dashboard/billing`,
    });
    res.json({ url: session.url });
  } catch (err) { next(err); }
};

// POST /api/billing/webhook — Stripe webhook handler
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const sub = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed': {
      if (sub.mode === 'subscription') {
        const stripeSub = await stripe.subscriptions.retrieve(sub.subscription);
        const plan = stripeSub.metadata?.plan || 'starter';
        await SubscriptionModel.upsert({
          clubId:               sub.metadata.clubId,
          stripeCustomerId:     sub.customer,
          stripeSubscriptionId: sub.subscription,
          plan,
          status:               stripeSub.status,
          currentPeriodEnd:     new Date(stripeSub.current_period_end * 1000),
        });
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const plan = sub.metadata?.plan || 'starter';
      await SubscriptionModel.updateByStripeSubscription(sub.id, {
        plan,
        status:              sub.status,
        currentPeriodEnd:    new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd:   sub.cancel_at_period_end,
      });
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await SubscriptionModel.updateByStripeSubscription(invoice.subscription, {
          status: 'past_due',
        });
      }
      break;
    }
  }

  res.json({ received: true });
};
