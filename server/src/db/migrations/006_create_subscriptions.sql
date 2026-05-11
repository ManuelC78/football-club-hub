-- Migration 006: Stripe subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id               UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  stripe_customer_id    VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  plan                  VARCHAR(50) NOT NULL DEFAULT 'free'
                        CHECK (plan IN ('free','starter','pro','elite')),
  status                VARCHAR(50) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','past_due','canceled','trialing','incomplete')),
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_club    ON subscriptions(club_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe  ON subscriptions(stripe_subscription_id);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
