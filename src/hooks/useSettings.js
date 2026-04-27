import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export const DEFAULT_DESCRIPTIONS = {
  mental:  '3 hours screen time max',
  workout: 'Gym or other sports activity',
  eating:  'Protein every meal',
  water:   '2L of water',
  walking: '7000 steps',
  sleep:   '8 hours of quality sleep',
  reading: '10 min per day',
};

export function useSettings() {
  const { user } = useAuth();
  const [descriptions, setDescriptions] = useState(DEFAULT_DESCRIPTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'settings', 'goals');
    getDoc(ref).then((snap) => {
      if (snap.exists()) setDescriptions({ ...DEFAULT_DESCRIPTIONS, ...snap.data() });
      setLoading(false);
    });
  }, [user?.uid]);

  const saveDescriptions = async (newDescs) => {
    setDescriptions(newDescs);
    const ref = doc(db, 'users', user.uid, 'settings', 'goals');
    await setDoc(ref, newDescs);
  };

  return { descriptions, loading, saveDescriptions };
}
