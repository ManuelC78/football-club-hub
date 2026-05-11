import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useAuthStore from '../store/auth.store';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '400px', margin: '100px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center', color: '#1a2a4a', marginBottom: '32px' }}>⚽ Create Account</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input type="text" placeholder="Full Name" value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          required style={inputStyle} />
        <input type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          required style={inputStyle} />
        <input type="password" placeholder="Password (min 8 chars)" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
          required minLength={8} style={inputStyle} />
        {error && <p style={{ color: 'red', fontSize: '0.9em' }}>{error}</p>}
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Creating account...' : 'Get Started Free'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '16px', color: '#666' }}>
        Already have an account? <Link href="/login" style={{ color: '#003388' }}>Log in</Link>
      </p>
    </main>
  );
}

const inputStyle = { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1em' };
const btnStyle   = { padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1em', fontWeight: 600, cursor: 'pointer' };
