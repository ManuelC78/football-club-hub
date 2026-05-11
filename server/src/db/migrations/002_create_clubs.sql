-- Migration 002: clubs
CREATE TABLE IF NOT EXISTS clubs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url    TEXT,
  county      VARCHAR(100),
  league      VARCHAR(255),
  founded_year INT,
  owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clubs_owner ON clubs(owner_id);

CREATE TRIGGER clubs_updated_at
  BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Club memberships (users can belong to multiple clubs)
CREATE TABLE IF NOT EXISTS club_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id    UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       VARCHAR(50) NOT NULL DEFAULT 'coach'
             CHECK (role IN ('manager','coach','player','parent')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);
