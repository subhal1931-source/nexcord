import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const action = mode === 'login' ? 'login' : 'register';
    const body = mode === 'login'
      ? { email: form.email, password: form.password }
      : { username: form.username, email: form.email, password: form.password };

    const res = await fetch(`/api/auth?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/app');
  };

  const demoLogin = async () => {
    setForm({ email: 'nova@nexcord.app', password: 'demo123' });
    setLoading(true);
    const res = await fetch('/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nova@nexcord.app', password: 'demo123' }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/app');
  };

  return (
    <>
      <Head>
        <title>Nexcord — Connect & Create</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div className="grid-bg min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(191,90,242,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.5s ease-out' }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div style={{
              width: '64px', height: '64px',
              background: 'linear-gradient(135deg, #00f5ff22, #bf5af222)',
              border: '1px solid rgba(0,245,255,0.3)',
              borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 30px rgba(0,245,255,0.2)',
            }}>
              <span style={{ fontSize: '28px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, background: 'linear-gradient(135deg, #00f5ff, #bf5af2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>N</span>
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: 700, background: 'linear-gradient(135deg, #00f5ff, #bf5af2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Nexcord</h1>
            <p style={{ color: '#8b949e', fontSize: '14px', marginTop: '6px' }}>Where communities come alive</p>
          </div>

          {/* Card */}
          <div style={{
            background: '#0d1117',
            border: '1px solid #21262d',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 0 40px rgba(0,0,0,0.5)',
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', background: '#080b10', borderRadius: '10px', padding: '4px', marginBottom: '24px', border: '1px solid #21262d' }}>
              {['login', 'register'].map(tab => (
                <button key={tab} onClick={() => { setMode(tab); setError(''); }}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: mode === tab ? 'rgba(0,245,255,0.1)' : 'transparent',
                    color: mode === tab ? '#00f5ff' : '#8b949e',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600, fontSize: '14px',
                    boxShadow: mode === tab ? '0 0 12px rgba(0,245,255,0.15)' : 'none',
                    transition: 'all 0.2s',
                  }}>{tab === 'login' ? 'Sign In' : 'Create Account'}</button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8b949e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Username</label>
                  <input
                    type="text" placeholder="CoolUsername" required
                    value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                    style={{ width: '100%', background: '#080b10', border: '1px solid #21262d', borderRadius: '8px', padding: '10px 14px', color: '#f0f6fc', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,245,255,0.4)'}
                    onBlur={e => e.target.style.borderColor = '#21262d'}
                  />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8b949e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
                <input
                  type="email" placeholder="you@example.com" required
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', background: '#080b10', border: '1px solid #21262d', borderRadius: '8px', padding: '10px 14px', color: '#f0f6fc', fontSize: '15px', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,245,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = '#21262d'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8b949e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
                <input
                  type="password" placeholder="••••••••" required
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ width: '100%', background: '#080b10', border: '1px solid #21262d', borderRadius: '8px', padding: '10px 14px', color: '#f0f6fc', fontSize: '15px', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,245,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = '#21262d'}
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(255,55,95,0.1)', border: '1px solid rgba(255,55,95,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#ff375f', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '12px',
                  background: loading ? 'rgba(0,245,255,0.1)' : 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(191,90,242,0.2))',
                  border: '1px solid rgba(0,245,255,0.4)',
                  borderRadius: '8px', color: '#00f5ff',
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 20px rgba(0,245,255,0.15)',
                  transition: 'all 0.2s',
                }}>
                {loading ? 'Loading...' : mode === 'login' ? 'Enter Nexcord' : 'Create Account'}
              </button>
            </form>

            <div style={{ position: 'relative', margin: '20px 0', textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #21262d', position: 'absolute', top: '50%', left: 0, right: 0 }} />
              <span style={{ background: '#0d1117', padding: '0 12px', color: '#8b949e', fontSize: '13px', position: 'relative' }}>or</span>
            </div>

            <button onClick={demoLogin}
              style={{
                width: '100%', padding: '12px',
                background: 'rgba(191,90,242,0.1)', border: '1px solid rgba(191,90,242,0.3)',
                borderRadius: '8px', color: '#bf5af2',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '14px',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
              ✨ Try Demo Account
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        input { transition: border-color 0.2s; }
        input::placeholder { color: #484f58; }
      `}</style>
    </>
  );
}
