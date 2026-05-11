const { query } = require('../db/pool');

const FixtureModel = {
  async findByClub(clubId, { from, to } = {}) {
    let sql = 'SELECT * FROM fixtures WHERE club_id = $1';
    const values = [clubId];
    if (from) { values.push(from); sql += ` AND date >= $${values.length}`; }
    if (to)   { values.push(to);   sql += ` AND date <= $${values.length}`; }
    sql += ' ORDER BY date ASC';
    const { rows } = await query(sql, values);
    return rows;
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM fixtures WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async create({ clubId, opponentName, date, location, isHome, competition, notes }) {
    const { rows } = await query(
      `INSERT INTO fixtures (club_id, opponent_name, date, location, is_home, competition, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [clubId, opponentName, date, location||null, isHome!==false, competition||null, notes||null]
    );
    return rows[0];
  },

  async update(id, fields) {
    const col = (s) => s.replace(/([A-Z])/g,'_$1').toLowerCase();
    const allowed = ['opponent_name','date','location','is_home','competition','notes'];
    const updates=[]; const values=[id];
    Object.entries(fields).forEach(([k,v]) => {
      const c=col(k);
      if(allowed.includes(c)){ values.push(v); updates.push(`${c} = $${values.length}`); }
    });
    if(!updates.length) return null;
    const { rows } = await query(`UPDATE fixtures SET ${updates.join(', ')} WHERE id = $1 RETURNING *`, values);
    return rows[0]||null;
  },

  async recordResult(id, { homeScore, awayScore, notes }) {
    const { rows } = await query(
      `UPDATE fixtures SET home_score=$2, away_score=$3, notes=COALESCE($4,notes)
       WHERE id=$1 RETURNING *`,
      [id, homeScore, awayScore, notes||null]
    );
    return rows[0]||null;
  },

  async delete(id) {
    await query('DELETE FROM fixtures WHERE id = $1', [id]);
  },
};

module.exports = FixtureModel;
