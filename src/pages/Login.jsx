import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError('Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #F2EDE8 0%, #E8E0D8 100%)',
      padding: '32px 24px',
      paddingTop: 'calc(32px + env(safe-area-inset-top))',
      paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
    }}>
      <div style={{ width: '100%', maxWidth: 340, textAlign: 'center' }}>
        {/* Logo */}
        <div style={{
          width: 80, height: 80, borderRadius: 24, background: '#fff',
          boxShadow: '0 8px 32px rgba(74,124,89,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 36,
        }}>📅</div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 32,
          fontWeight: 700, color: '#1A1A1A', marginBottom: 8, lineHeight: 1.2,
        }}>Day by Day</h1>
        <p style={{ color: '#9C9490', fontSize: 15, marginBottom: 40, lineHeight: 1.5 }}>
          Your personal wellbeing journal
        </p>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 24,
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          padding: '28px 24px',
        }}>
          <p style={{ color: '#9C9490', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Track daily goals, write reflections,<br />and capture moments that matter.
          </p>

          {error && (
            <div style={{
              background: '#fff5f5', border: '1px solid #fecaca',
              borderRadius: 12, padding: '10px 14px', marginBottom: 16,
              color: '#dc2626', fontSize: 13,
            }}>{error}</div>
          )}

          <button onClick={handleSignIn} disabled={loading} style={{
            width: '100%', padding: '15px 20px',
            background: loading ? '#6BA880' : 'linear-gradient(135deg, #4A7C59, #3a6347)',
            color: '#fff', border: 'none', borderRadius: 16,
            fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 4px 16px rgba(74,124,89,0.3)',
            transition: 'transform 0.1s',
          }}>
            {!loading && (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" opacity=".9"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" opacity=".9"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="white" opacity=".9"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" opacity=".9"/>
              </svg>
            )}
            {loading ? 'Opening Google…' : 'Continue with Google'}
          </button>
        </div>

        <p style={{ color: '#C4BDB8', fontSize: 12, marginTop: 24 }}>
          🔒 Private & synced across all your devices
        </p>
      </div>
    </div>
  );
}
