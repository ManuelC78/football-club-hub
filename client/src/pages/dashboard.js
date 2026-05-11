import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../store/auth.store';
import Link from 'next/link';

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) return null;

  const modules = [
    { icon: '🗂️', title: 'My Club',     desc: 'Manage club settings and members',   href: '/dashboard/club' },
    { icon: '👤', title: 'Squad',        desc: 'Player profiles and management',      href: '/dashboard/squad' },
    { icon: '📋', title: 'Training',     desc: 'Plan and schedule sessions',           href: '/dashboard/training' },
    { icon: '📅', title: 'Fixtures',     desc: 'Upcoming matches and results',         href: '/dashboard/fixtures' },
    { icon: '💬', title: 'Communication',desc: 'Announcements and messages',           href: '/dashboard/comms' },
    { icon: '📊', title: 'Reports',      desc: 'Club analytics and player progress',   href: '/dashboard/reports' },
  ];

  return (
    <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f0f4fb' }}>
      {/* Nav */}
      <nav style={{ background: '#001f44', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1em' }}>⚽ Football Club Hub</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9em' }}>Hi, {user.name}</span>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>
            Log out
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ color: '#1a2a4a', marginBottom: '8px' }}>Welcome back, {user.name} 👋</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>What would you like to manage today?</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '16px' }}>
          {modules.map(({ icon, title, desc, href }) => (
            <Link key={title} href={href} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,50,0.07)', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,100,0.12)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,50,0.07)'}>
                <div style={{ fontSize: '2em', marginBottom: '10px' }}>{icon}</div>
                <h3 style={{ color: '#1a2a4a', marginBottom: '6px' }}>{title}</h3>
                <p style={{ color: '#888', fontSize: '0.88em' }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
