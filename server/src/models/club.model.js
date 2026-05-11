const { query } = require('../db/pool');

const ClubModel = {
  async findAll() {
    const { rows } = await query(
      `SELECT c.*, u.name AS owner_name
       FROM clubs c JOIN users u ON c.owner_id = u.id
       ORDER BY c.created_at DESC`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT c.*, u.name AS owner_name
       FROM clubs c JOIN users u ON c.owner_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByOwner(ownerId) {
    const { rows } = await query(
      'SELECT * FROM clubs WHERE owner_id = $1 ORDER BY created_at DESC',
      [ownerId]
    );
    return rows;
  },

  async create({ name, description, county, league, foundedYear, logoUrl, ownerId }) {
    const { rows } = await query(
      `INSERT INTO clubs (name, description, county, league, founded_year, logo_url, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, county, league, foundedYear, logoUrl, ownerId]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['name','description','county','league','founded_year','logo_url'];
    const updates = [];
    const values  = [id];
    Object.entries(fields).forEach(([k, v]) => {
      // camelCase → snake_case
      const col = k.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowed.includes(col)) {
        values.push(v);
        updates.push(`${col} = $${values.length}`);
      }
    });
    if (!updates.length) return null;
    const { rows } = await query(
      `UPDATE clubs SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async delete(id) {
    await query('DELETE FROM clubs WHERE id = $1', [id]);
  },
};

module.exports = ClubModel;
