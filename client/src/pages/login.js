import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useAuthStore from '../store/auth.store';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '400px', margin: '100px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center', color: '#1a2a4a', marginBottom: '32px' }}>⚽ Log In</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          required style={inputStyle} />
        <input type="password" placeholder="Password" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
          required style={inputStyle} />
        {error && <p style={{ color: 'red', fontSize: '0.9em' }}>{error}</p>}
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '16px', color: '#666' }}>
        No account? <Link href="/register" style={{ color: '#003388' }}>Register free</Link>
      </p>
    </main>
  );
}

const inputStyle = { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1em' };
const btnStyle   = { padding: '12px', background: '#003388', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1em', fontWeight: 600, cursor: 'pointer' };
