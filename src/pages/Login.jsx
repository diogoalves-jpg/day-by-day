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
      setError(e.message || 'Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F5F0EB',
      padding: '24px 24px',
      paddingTop: 'calc(24px + env(safe-area-inset-top))',
      paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
    }}>
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📅</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Day by Day
        </h1>
        <p style={{ color: '#888880', fontSize: 14, marginBottom: 32 }}>
          Your personal wellbeing journal
        </p>

        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #E8E3DE',
          borderRadius: 20,
          padding: 24,
        }}>
          <p style={{ color: '#888880', fontSize: 14, marginBottom: 20 }}>
            Track daily goals, write reflections, and capture moments that matter.
          </p>

          {error && (
            <p style={{ color: '#E74C3C', fontSize: 13, marginBottom: 12, padding: '8px 12px', backgroundColor: '#fef2f2', borderRadius: 10 }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 16px',
              backgroundColor: loading ? '#6BA880' : '#4A7C59',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
            </svg>
            {loading ? 'Redirecting…' : 'Continue with Google'}
          </button>
        </div>

        <p style={{ color: '#C0BBB5', fontSize: 12, marginTop: 20 }}>
          Your data is private and synced across all your devices.
        </p>
      </div>
    </div>
  );
}
