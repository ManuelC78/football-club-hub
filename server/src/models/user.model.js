const { query } = require('../db/pool');

const UserModel = {
  async findByEmail(email) {
    const { rows } = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query(
      'SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  async create({ email, passwordHash, name, role = 'manager' }) {
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at`,
      [email, passwordHash, name, role]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['name', 'avatar_url'];
    const updates = Object.entries(fields)
      .filter(([k]) => allowed.includes(k))
      .map(([k, v], i) => `${k} = $${i + 2}`);
    if (!updates.length) return null;
    const values = Object.entries(fields)
      .filter(([k]) => allowed.includes(k))
      .map(([, v]) => v);
    const { rows } = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $1
       RETURNING id, email, name, role, avatar_url`,
      [id, ...values]
    );
    return rows[0] || null;
  },
};

module.exports = UserModel;
