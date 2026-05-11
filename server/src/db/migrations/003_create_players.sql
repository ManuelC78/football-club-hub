-- Migration 003: players
CREATE TABLE IF NOT EXISTS players (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id      UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  first_name   VARCHAR(100) NOT NULL,
  last_name    VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  position     VARCHAR(50),
  squad_number INT,
  avatar_url   TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_club ON players(club_id);

CREATE TRIGGER players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
