import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectPending, setRedirectPending] = useState(false);

  useEffect(() => {
    // Check if we're returning from a redirect sign-in
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((err) => {
        console.error('Redirect result error:', err);
      })
      .finally(() => {
        setRedirectPending(false);
      });

    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    if (isMobile) {
      setRedirectPending(true);
      await signInWithRedirect(auth, provider);
    } else {
      await signInWithPopup(auth, provider);
    }
  };

  const signOut = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading: loading || redirectPending, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
