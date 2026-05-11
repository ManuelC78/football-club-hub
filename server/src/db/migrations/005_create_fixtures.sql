-- Migration 005: fixtures
CREATE TABLE IF NOT EXISTS fixtures (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id         UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  opponent_name   VARCHAR(255) NOT NULL,
  date            TIMESTAMPTZ NOT NULL,
  location        VARCHAR(255),
  is_home         BOOLEAN NOT NULL DEFAULT true,
  competition     VARCHAR(255),
  home_score      INT,
  away_score      INT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fixtures_club ON fixtures(club_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_date ON fixtures(date);

CREATE TRIGGER fixtures_updated_at
  BEFORE UPDATE ON fixtures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
