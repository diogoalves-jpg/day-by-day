import { useState, useRef } from 'react';
import { X, Check, ImageIcon } from 'lucide-react';
import { GOALS, getGreeting, toDateStr, formatDisplayDate } from '../lib/goals';
import { useDay } from '../hooks/useDay';
import { useSettings } from '../hooks/useSettings';
import { compressImage } from '../lib/imageUtils';

const MOODS = [
  { value: 'great',   emoji: '😄', label: 'Great' },
  { value: 'good',    emoji: '🙂', label: 'Good'  },
  { value: 'okay',    emoji: '😐', label: 'Okay'  },
  { value: 'low',     emoji: '😕', label: 'Low'   },
  { value: 'bad',     emoji: '😞', label: 'Bad'   },
];

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

// Which goals have a running counter and what their units are
const COUNTER_GOALS = {
  water:   { unit: 'ml',   logKey: 'waterLog',   placeholder: 'How many ml?' },
  protein: { unit: 'g',    logKey: 'proteinLog',  placeholder: 'How many grams?' },
  kcals:   { unit: 'kcal', logKey: 'kcalsLog',    placeholder: 'How many kcal?' },
};

export default function Today() {
  const today = toDateStr();
  const { day, loading, updateGoal, updateJournal, updateMood, addLog, removeLog, addPhoto, removePhoto } = useDay(today);
  const { descriptions } = useSettings();
  const [journalText, setJournalText] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  // Counter state
  const [addingFor, setAddingFor]   = useState(null); // goalId whose add-input is open
  const [addInput, setAddInput]     = useState('');
  const [logOpenFor, setLogOpenFor] = useState(null); // goalId whose entry list is shown

  const openAdd = (goalId) => {
    setAddingFor(goalId);
    setAddInput('');
    setLogOpenFor(null);
  };
  const closeAdd = () => { setAddingFor(null); setAddInput(''); };

  const confirmAdd = async (goalId) => {
    const val = parseInt(addInput, 10);
    if (!val || val <= 0) return;
    await addLog(goalId, val);
    closeAdd();
  };

  const toggleLog = (goalId) =>
    setLogOpenFor(prev => (prev === goalId ? null : goalId));

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

      {/* Mood */}
      <div>
        <SectionLabel>How are you feeling today?</SectionLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
          {MOODS.map((m) => {
            const selected = day?.mood === m.value;
            return (
              <button
                key={m.value}
                onClick={() => updateMood(selected ? null : m.value)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 5, padding: '12px 4px', borderRadius: 18, border: 'none',
                  cursor: 'pointer',
                  background: selected ? 'rgba(74,124,89,0.12)' : C.card,
                  boxShadow: selected ? 'none' : C.shadow,
                  outline: selected ? '1.5px solid rgba(74,124,89,0.35)' : `1px solid ${C.border}`,
                  transition: 'all 0.15s',
                  transform: selected ? 'scale(1.06)' : 'scale(1)',
                }}>
                <span style={{ fontSize: 26, lineHeight: 1 }}>{m.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: selected ? C.green : C.muted }}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Goals */}
      <div>
        <SectionLabel>Daily Goals</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {GOALS.map((goal) => {
            const done = !!goals[goal.id];
            const cfg = COUNTER_GOALS[goal.id];
            const log = cfg ? (day?.[cfg.logKey] || []) : [];
            const total = log.reduce((s, e) => s + e.amount, 0);
            const hasCounter = !!cfg;
            const isAdding = addingFor === goal.id;
            const isLogOpen = logOpenFor === goal.id;

            // Bottom radius: flat when counter panel is visible
            const btnRadius = hasCounter ? '18px 18px 0 0' : '18px';
            const cardOutline = done ? `1px solid ${C.greenBorder}` : `1px solid ${C.border}`;

            return (
              <div key={goal.id}>
                {/* Goal toggle button */}
                <button onClick={() => updateGoal(goal.id, !done)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: btnRadius, border: 'none', cursor: 'pointer',
                    background: done ? C.greenLight : C.card,
                    boxShadow: done ? 'none' : C.shadow,
                    outline: cardOutline,
                    transition: 'all 0.2s', textAlign: 'left',
                  }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                    background: done ? 'rgba(74,124,89,0.15)' : '#F5F0EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: done ? 0 : 20, transition: 'all 0.2s',
                  }}>
                    {done ? <Check size={20} color={C.green} strokeWidth={2.5} /> : goal.emoji}
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

                {/* Counter panel — only for water / protein / kcals */}
                {hasCounter && (
                  <div style={{
                    background: done ? 'rgba(74,124,89,0.06)' : '#F9F6F3',
                    borderRadius: '0 0 18px 18px',
                    outline: cardOutline,
                    outlineOffset: -1,
                    padding: '10px 16px 12px',
                    boxShadow: done ? 'none' : C.shadow,
                  }}>
                    {/* Total row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: done ? C.green : C.text }}>
                        {total.toLocaleString()}
                        <span style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginLeft: 4 }}>{cfg.unit}</span>
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {/* − shows / hides entries list */}
                        <button
                          onClick={() => { closeAdd(); toggleLog(goal.id); }}
                          style={{
                            width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: isLogOpen ? '#E8756A22' : '#E8E2DC',
                            color: isLogOpen ? '#E8756A' : C.muted,
                            fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>−</button>
                        {/* + opens add input */}
                        <button
                          onClick={() => isAdding ? closeAdd() : openAdd(goal.id)}
                          style={{
                            width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: isAdding ? C.green + '33' : C.green,
                            color: '#fff',
                            fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: isAdding ? 'none' : '0 2px 8px rgba(74,124,89,0.3)',
                          }}>+</button>
                      </div>
                    </div>

                    {/* Inline add input */}
                    {isAdding && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                        <input
                          autoFocus
                          type="number"
                          inputMode="numeric"
                          value={addInput}
                          onChange={e => setAddInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') confirmAdd(goal.id); if (e.key === 'Escape') closeAdd(); }}
                          placeholder={cfg.placeholder}
                          style={{
                            flex: 1, background: '#fff', border: `1px solid ${C.border}`,
                            borderRadius: 10, padding: '8px 12px', fontSize: 15,
                            outline: 'none', fontFamily: 'inherit', color: C.text,
                          }}
                        />
                        <button onClick={() => confirmAdd(goal.id)} style={{
                          width: 34, height: 34, borderRadius: 10, border: 'none', cursor: 'pointer',
                          background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={16} strokeWidth={3} />
                        </button>
                        <button onClick={closeAdd} style={{
                          width: 34, height: 34, borderRadius: 10, border: 'none', cursor: 'pointer',
                          background: '#E8E2DC', color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <X size={15} />
                        </button>
                      </div>
                    )}

                    {/* Entry chips for removal */}
                    {isLogOpen && (
                      <div style={{ marginTop: 10 }}>
                        {log.length === 0 ? (
                          <p style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>No entries yet.</p>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {log.map(e => (
                              <div key={e.id} style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                background: '#fff', border: `1px solid ${C.border}`,
                                borderRadius: 8, padding: '4px 8px 4px 10px', fontSize: 13, fontWeight: 600,
                              }}>
                                {e.amount.toLocaleString()}{cfg.unit}
                                <button onClick={() => removeLog(goal.id, e.id)} style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  color: '#E8756A', padding: 0, lineHeight: 1, fontSize: 16, fontWeight: 700,
                                }}>×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
