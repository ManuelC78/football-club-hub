const { query } = require('../db/pool');

const SessionModel = {
  async findByClub(clubId) {
    const { rows } = await query(
      `SELECT s.*, u.name AS coach_name
       FROM training_sessions s JOIN users u ON s.coach_id = u.id
       WHERE s.club_id = $1 ORDER BY s.date DESC`,
      [clubId]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT s.*, u.name AS coach_name,
         (SELECT json_agg(json_build_object('player_id', a.player_id, 'present', a.present, 'notes', a.notes))
          FROM session_attendance a WHERE a.session_id = s.id) AS attendance
       FROM training_sessions s JOIN users u ON s.coach_id = u.id
       WHERE s.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ clubId, coachId, title, description, date, durationMins, location, objectives, drills }) {
    const { rows } = await query(
      `INSERT INTO training_sessions (club_id, coach_id, title, description, date, duration_mins, location, objectives, drills)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [clubId, coachId, title, description||null, date, durationMins||90, location||null, objectives||[], JSON.stringify(drills||[])]
    );
    return rows[0];
  },

  async update(id, fields) {
    const col = (s) => s.replace(/([A-Z])/g,'_$1').toLowerCase();
    const allowed = ['title','description','date','duration_mins','location','objectives','drills'];
    const updates=[]; const values=[id];
    Object.entries(fields).forEach(([k,v]) => {
      const c=col(k);
      if(allowed.includes(c)){ values.push(v); updates.push(`${c} = $${values.length}`); }
    });
    if(!updates.length) return null;
    const { rows } = await query(`UPDATE training_sessions SET ${updates.join(', ')} WHERE id = $1 RETURNING *`, values);
    return rows[0]||null;
  },

  async delete(id) {
    await query('DELETE FROM training_sessions WHERE id = $1', [id]);
  },

  async upsertAttendance(sessionId, attendance) {
    // attendance = [{ playerId, present, notes }]
    const client = require('../db/pool').pool;
    const conn = await client.connect();
    try {
      await conn.query('BEGIN');
      await conn.query('DELETE FROM session_attendance WHERE session_id = $1', [sessionId]);
      for (const { playerId, present, notes } of attendance) {
        await conn.query(
          `INSERT INTO session_attendance (session_id, player_id, present, notes)
           VALUES ($1, $2, $3, $4)`,
          [sessionId, playerId, present, notes || null]
        );
      }
      await conn.query('COMMIT');
    } catch (e) {
      await conn.query('ROLLBACK');
      throw e;
    } finally {
      conn.release();
    }
  },
};

module.exports = SessionModel;
