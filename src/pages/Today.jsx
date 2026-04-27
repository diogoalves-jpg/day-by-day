import { useState, useRef } from 'react';
import { Camera, X, Check, ImageIcon } from 'lucide-react';
import { GOALS, getGreeting, toDateStr, formatDisplayDate } from '../lib/goals';
import { useDay } from '../hooks/useDay';
import { useSettings } from '../hooks/useSettings';
import { compressImage } from '../lib/imageUtils';

const C = {
  bg: '#F2EDE8',
  card: '#FFFFFF',
  green: '#4A7C59',
  greenLight: 'rgba(74,124,89,0.1)',
  greenBorder: 'rgba(74,124,89,0.25)',
  border: 'rgba(0,0,0,0.07)',
  shadow: '0 2px 12px rgba(0,0,0,0.06)',
  muted: '#9C9490',
  text: '#1A1A1A',
};

function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.card, borderRadius: 20, boxShadow: C.shadow,
                  border: `1px solid ${C.border}`, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
                textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
      {children}
    </p>
  );
}

export default function Today() {
  const today = toDateStr();
  const { day, loading, updateGoal, updateJournal, addPhoto, removePhoto } = useDay(today);
  const { descriptions } = useSettings();
  const [journalText, setJournalText] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const goals = day?.goals || {};
  const completedCount = Object.values(goals).filter(Boolean).length;
  const percent = Math.round((completedCount / GOALS.length) * 100);

  const circumference = 2 * Math.PI * 22;
  const dashOffset = circumference - (percent / 100) * circumference;

  const handleJournalBlur = async () => {
    const text = journalText !== '' ? journalText : (day?.journal || '');
    await updateJournal(text);
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 2000);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await compressImage(file);
      await addPhoto(base64);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: C.muted, fontSize: 14 }}>Loading…</div>
    </div>
  );

  const journalValue = journalText !== '' ? journalText : (day?.journal || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
        <div>
          <p style={{ fontSize: 13, color: C.muted, fontWeight: 500, marginBottom: 4 }}>
            {formatDisplayDate()}
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>
            {getGreeting()}
          </h1>
        </div>

        {/* Progress ring */}
        <div style={{ position: 'relative', width: 60, height: 60 }}>
          <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3.5" />
            <circle cx="30" cy="30" r="22" fill="none" stroke={C.green}
              strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{percent}%</span>
            <span style={{ fontSize: 9, color: C.muted, fontWeight: 500 }}>Today</span>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div>
        <SectionLabel>Daily Goals</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {GOALS.map((goal) => {
            const done = !!goals[goal.id];
            return (
              <button key={goal.id} onClick={() => updateGoal(goal.id, !done)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 18, border: 'none', cursor: 'pointer',
                  background: done ? C.greenLight : C.card,
                  boxShadow: done ? 'none' : C.shadow,
                  outline: done ? `1px solid ${C.greenBorder}` : `1px solid ${C.border}`,
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                  background: done ? 'rgba(74,124,89,0.15)' : '#F5F0EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: done ? 0 : 20, transition: 'all 0.2s',
                }}>
                  {done
                    ? <Check size={20} color={C.green} strokeWidth={2.5} />
                    : goal.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 15, fontWeight: 600, lineHeight: 1.2,
                    color: done ? C.green : C.text,
                    textDecoration: done ? 'line-through' : 'none',
                    opacity: done ? 0.75 : 1,
                  }}>{goal.label}</p>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 2, overflow: 'hidden',
                               textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {descriptions[goal.id]}
                  </p>
                </div>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  border: done ? 'none' : '2px solid #DDD8D3',
                  background: done ? C.green : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {done && <Check size={13} color="#fff" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Journal */}
      <div>
        <SectionLabel>
          Journal {journalSaved && <span style={{ color: C.green, textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>· Saved</span>}
        </SectionLabel>
        <Card>
          <textarea
            style={{
              width: '100%', padding: '16px', background: 'transparent', border: 'none',
              resize: 'none', outline: 'none', fontSize: 15, lineHeight: 1.6,
              color: C.text, fontFamily: "'Inter', sans-serif",
              borderRadius: 20, minHeight: 120,
            }}
            placeholder="How was your day? Write a few words…"
            value={journalValue}
            onChange={(e) => setJournalText(e.target.value)}
            onBlur={handleJournalBlur}
          />
        </Card>
      </div>

      {/* Photos */}
      <div>
        <SectionLabel>Photos</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {(day?.photos || []).map((photo) => (
            <div key={photo.id} style={{ position: 'relative', width: 90, height: 90, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
              <img src={photo.base64} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => removePhoto(photo.id)} style={{
                position: 'absolute', top: 5, right: 5,
                background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <X size={12} color="#fff" />
              </button>
            </div>
          ))}

          {/* Add photo button */}
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
            width: 90, height: 90, borderRadius: 16,
            border: '2px dashed #D5CFC9', background: 'rgba(255,255,255,0.6)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 5, cursor: uploading ? 'default' : 'pointer',
            color: C.muted, opacity: uploading ? 0.5 : 1,
          }}>
            <ImageIcon size={22} color={C.muted} />
            <span style={{ fontSize: 10, fontWeight: 600 }}>{uploading ? 'Saving…' : 'Add photo'}</span>
          </button>
          {/* No capture attribute — lets user choose camera or gallery */}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
        </div>
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}
