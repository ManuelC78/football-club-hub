-- Migration 004: training sessions
CREATE TABLE IF NOT EXISTS training_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id     UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  coach_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  date        TIMESTAMPTZ NOT NULL,
  duration_mins INT DEFAULT 90,
  location    VARCHAR(255),
  objectives  TEXT[],
  drills      JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_club ON training_sessions(club_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON training_sessions(date);

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON training_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Attendance
CREATE TABLE IF NOT EXISTS session_attendance (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  player_id  UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  present    BOOLEAN NOT NULL DEFAULT false,
  notes      TEXT,
  UNIQUE(session_id, player_id)
);
