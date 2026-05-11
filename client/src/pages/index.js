import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Football Club Hub — Manage Your Club</title>
        <meta name="description" content="The all-in-one platform for grassroots and youth football clubs" />
      </Head>
      <main style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '3em', marginBottom: '16px' }}>⚽</div>
        <h1 style={{ fontSize: '2.5em', marginBottom: '12px', color: '#1a2a4a' }}>Football Club Hub</h1>
        <p style={{ fontSize: '1.2em', color: '#555', marginBottom: '32px' }}>
          The all-in-one management platform for grassroots and youth football clubs.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" style={{ background: '#003388', color: 'white', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            Log In
          </Link>
          <Link href="/register" style={{ background: '#27ae60', color: 'white', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            Get Started Free
          </Link>
        </div>
        <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
          {[
            ['🗂️', 'Club Management', 'Organise members, roles, and teams'],
            ['📋', 'Training Planner', 'Build and schedule training sessions'],
            ['📅', 'Fixtures & Results', 'Track your schedule and record results'],
            ['👤', 'Squad Manager', 'Player profiles and attendance tracking'],
            ['💬', 'Team Communication', 'Announcements and notifications'],
            ['👪', 'Parent Portal', 'Consent forms, payments, and updates'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background: '#f8faff', padding: '20px', borderRadius: '12px', textAlign: 'left' }}>
              <div style={{ fontSize: '1.6em', marginBottom: '8px' }}>{icon}</div>
              <h3 style={{ color: '#1a2a4a', marginBottom: '6px' }}>{title}</h3>
              <p style={{ color: '#666', fontSize: '0.9em' }}>{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
