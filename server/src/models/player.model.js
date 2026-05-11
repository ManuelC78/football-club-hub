const { query } = require('../db/pool');

const PlayerModel = {
  async findByClub(clubId) {
    const { rows } = await query(
      `SELECT * FROM players WHERE club_id = $1 AND is_active = true ORDER BY last_name, first_name`,
      [clubId]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM players WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async create({ clubId, firstName, lastName, dateOfBirth, position, squadNumber, avatarUrl, notes, userId }) {
    const { rows } = await query(
      `INSERT INTO players (club_id, user_id, first_name, last_name, date_of_birth, position, squad_number, avatar_url, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [clubId, userId || null, firstName, lastName, dateOfBirth || null, position || null, squadNumber || null, avatarUrl || null, notes || null]
    );
    return rows[0];
  },

  async update(id, fields) {
    const col = (s) => s.replace(/([A-Z])/g,'_$1').toLowerCase();
    const allowed = ['first_name','last_name','date_of_birth','position','squad_number','avatar_url','notes','is_active'];
    const updates = []; const values = [id];
    Object.entries(fields).forEach(([k,v]) => {
      const c = col(k);
      if (allowed.includes(c)) { values.push(v); updates.push(`${c} = $${values.length}`); }
    });
    if (!updates.length) return null;
    const { rows } = await query(`UPDATE players SET ${updates.join(', ')} WHERE id = $1 RETURNING *`, values);
    return rows[0] || null;
  },

  async delete(id) {
    await query('UPDATE players SET is_active = false WHERE id = $1', [id]);
  },
};

module.exports = PlayerModel;
