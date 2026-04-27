import { useState, useEffect } from 'react';
import {
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export function useDay(dateStr) {
  const { user } = useAuth();
  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(true);

  const docRef = user ? doc(db, 'users', user.uid, 'days', dateStr) : null;
  const photosCol = user ? collection(db, 'users', user.uid, 'days', dateStr, 'photos') : null;

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      getDoc(docRef),
      getDocs(photosCol),
    ]).then(([snap, photoSnap]) => {
      const photos = photoSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.timestamp - b.timestamp);

      if (snap.exists()) {
        setDay({ ...snap.data(), photos });
      } else {
        setDay({ goals: {}, journal: '', photos });
      }
      setLoading(false);
    });
  }, [dateStr, user?.uid]);

  const ensureDoc = async () => {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, { goals: {}, journal: '', completionPercent: 0, photoCount: 0 });
    }
  };

  const updateGoal = async (goalId, value) => {
    const goals = { ...(day?.goals || {}), [goalId]: value };
    const completed = Object.values(goals).filter(Boolean).length;
    const percent = Math.round((completed / 7) * 100);
    const update = { goals, completionPercent: percent };
    setDay((d) => ({ ...d, ...update }));
    await ensureDoc();
    await updateDoc(docRef, update);
  };

  const updateJournal = async (text) => {
    setDay((d) => ({ ...d, journal: text }));
    await ensureDoc();
    await updateDoc(docRef, { journal: text });
  };

  const addPhoto = async (base64, timestamp = Date.now()) => {
    await ensureDoc();
    const newDoc = await addDoc(photosCol, { base64, timestamp });
    const photo = { id: newDoc.id, base64, timestamp };
    const newPhotos = [...(day?.photos || []), photo];
    setDay((d) => ({ ...d, photos: newPhotos }));
    // Keep photoCount on the day doc so Recap stats can read it
    await updateDoc(docRef, { photoCount: newPhotos.length });
  };

  const removePhoto = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'days', dateStr, 'photos', id));
    const newPhotos = (day?.photos || []).filter((p) => p.id !== id);
    setDay((d) => ({ ...d, photos: newPhotos }));
    await updateDoc(docRef, { photoCount: newPhotos.length });
  };

  return { day, loading, updateGoal, updateJournal, addPhoto, removePhoto };
}
