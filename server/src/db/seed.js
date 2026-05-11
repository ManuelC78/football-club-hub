require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, pool } = require('./pool');

async function seed() {
  console.log('Seeding database...');
  try {
    // Admin user
    const hash = await bcrypt.hash('Admin1234!', 12);
    await query(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES ('admin@footballclubhub.com', $1, 'FCH Admin', 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [hash]);

    // Demo manager
    const managerHash = await bcrypt.hash('Manager123!', 12);
    const { rows: [manager] } = await query(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES ('manager@demo.com', $1, 'Demo Manager', 'manager')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [managerHash]);

    // Demo club
    const { rows: [club] } = await query(`
      INSERT INTO clubs (name, description, county, league, owner_id)
      VALUES ('Notts Rovers FC', 'A demo grassroots club in Nottinghamshire', 'East Midlands', 'YEL', $1)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [manager.id]);

    if (club) {
      // Demo players
      const players = [
        ['James', 'Smith',  '2010-03-15', 'Goalkeeper', 1],
        ['Liam',  'Jones',  '2010-07-22', 'Defender',   5],
        ['Noah',  'Brown',  '2011-01-10', 'Midfielder', 8],
        ['Oliver','Wilson', '2010-09-05', 'Forward',   10],
        ['Harry', 'Taylor', '2011-04-18', 'Defender',   4],
      ];
      for (const [fn, ln, dob, pos, num] of players) {
        await query(`
          INSERT INTO players (club_id, first_name, last_name, date_of_birth, position, squad_number)
          VALUES ($1,$2,$3,$4,$5,$6)
        `, [club.id, fn, ln, dob, pos, num]);
      }
      console.log('  ✅ Demo club + 5 players seeded');
    }

    console.log('\nSeed complete!');
    console.log('  Admin:   admin@footballclubhub.com / Admin1234!');
    console.log('  Manager: manager@demo.com / Manager123!');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
