const { query } = require('../db/pool');

const SubscriptionModel = {
  async findByClub(clubId) {
    const { rows } = await query(
      'SELECT * FROM subscriptions WHERE club_id = $1 LIMIT 1', [clubId]
    );
    return rows[0] || null;
  },

  async findByStripeCustomer(stripeCustomerId) {
    const { rows } = await query(
      'SELECT * FROM subscriptions WHERE stripe_customer_id = $1 LIMIT 1',
      [stripeCustomerId]
    );
    return rows[0] || null;
  },

  async findByStripeSubscription(stripeSubId) {
    const { rows } = await query(
      'SELECT * FROM subscriptions WHERE stripe_subscription_id = $1 LIMIT 1',
      [stripeSubId]
    );
    return rows[0] || null;
  },

  async upsert({ clubId, stripeCustomerId, stripeSubscriptionId, plan, status, currentPeriodEnd, cancelAtPeriodEnd }) {
    const { rows } = await query(`
      INSERT INTO subscriptions
        (club_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end, cancel_at_period_end)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (club_id) DO UPDATE SET
        stripe_customer_id     = EXCLUDED.stripe_customer_id,
        stripe_subscription_id = EXCLUDED.stripe_subscription_id,
        plan                   = EXCLUDED.plan,
        status                 = EXCLUDED.status,
        current_period_end     = EXCLUDED.current_period_end,
        cancel_at_period_end   = EXCLUDED.cancel_at_period_end,
        updated_at             = NOW()
      RETURNING *
    `, [clubId, stripeCustomerId, stripeSubscriptionId, plan, status, currentPeriodEnd, cancelAtPeriodEnd||false]);
    return rows[0];
  },

  async updateByStripeSubscription(stripeSubId, fields) {
    const { rows } = await query(`
      UPDATE subscriptions SET
        plan                = COALESCE($2, plan),
        status              = COALESCE($3, status),
        current_period_end  = COALESCE($4, current_period_end),
        cancel_at_period_end= COALESCE($5, cancel_at_period_end),
        updated_at          = NOW()
      WHERE stripe_subscription_id = $1
      RETURNING *
    `, [stripeSubId, fields.plan, fields.status, fields.currentPeriodEnd, fields.cancelAtPeriodEnd]);
    return rows[0] || null;
  },
};

module.exports = SubscriptionModel;
