import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, BookOpen, Image, Pencil, Check } from 'lucide-react';

const MOODS = [
  { value: 'great', emoji: '😄', label: 'Great' },
  { value: 'good',  emoji: '🙂', label: 'Good'  },
  { value: 'okay',  emoji: '😐', label: 'Okay'  },
  { value: 'low',   emoji: '😕', label: 'Low'   },
  { value: 'bad',   emoji: '😞', label: 'Bad'   },
];
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { toDateStr, GOALS } from '../lib/goals';

const C = {
  bg: '#E8F0FA', card: '#FFFFFF', green: '#4A7C59',
  border: 'rgba(0,0,0,0.07)', shadow: '0 2px 12px rgba(0,0,0,0.06)',
  muted: '#9C9490', text: '#1A1A1A',
};

function getHeatColor(pct) {
  if (pct === undefined) return null;
  if (pct === 0) return '#E8756A';
  if (pct < 50) return '#E8A84A';
  if (pct < 80) return '#A8C840';
  return '#4A7C59';
}

function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + 3 - ((d.getDay()+6)%7));
  const w1 = new Date(d.getFullYear(),0,4);
  const wk = 1 + Math.round(((d-w1)/86400000 - 3 + ((w1.getDay()+6)%7))/7);
  return `${d.getFullYear()}-W${String(wk).padStart(2,'0')}`;
}

function SectionLabel({ children }) {
  return <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
    textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>{children}</p>;
}

function DayDetailSheet({ dateStr, onClose, allDays }) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!user || !dateStr) return;
    getDocs(collection(db, 'users', user.uid, 'days', dateStr, 'photos'))
      .then(snap => setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => a.timestamp-b.timestamp)));
  }, [dateStr, user?.uid]);

  const data = allDays[dateStr];
  const date = new Date(dateStr + 'T12:00:00');
  const label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const pct = data?.completionPercent ?? 0;
  const goals = data?.goals || {};
  const completedGoals = GOALS.filter(g => goals[g.id]);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        zIndex: 200, backdropFilter: 'blur(4px)',
      }} />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        background: '#fff', borderRadius: '24px 24px 0 0',
        maxHeight: '80dvh', overflow: 'auto',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, background: '#E0DAD5', borderRadius: 2 }} />
        </div>

        <div style={{ padding: '8px 20px 16px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 2 }}>{label}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: getHeatColor(pct) || '#DDD' }} />
                <span style={{ fontSize: 15, fontWeight: 600 }}>{pct}% completed</span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: '#E8F0FA', border: 'none', borderRadius: '50%',
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} color={C.muted} />
            </button>
          </div>

          {/* Mood */}
          {data?.mood && (() => {
            const m = MOODS.find(x => x.value === data.mood);
            return m ? (
              <div style={{ marginBottom: 20 }}>
                <SectionLabel>Mood</SectionLabel>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(74,124,89,0.08)', border: '1px solid rgba(74,124,89,0.2)',
                  borderRadius: 12, padding: '8px 14px' }}>
                  <span style={{ fontSize: 22 }}>{m.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.green }}>{m.label}</span>
                </div>
              </div>
            ) : null;
          })()}

          {/* Goals achieved */}
          {completedGoals.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionLabel>Goals completed</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {completedGoals.map(g => (
                  <div key={g.id} style={{
                    background: 'rgba(74,124,89,0.1)', border: '1px solid rgba(74,124,89,0.2)',
                    borderRadius: 10, padding: '6px 12px', fontSize: 13, fontWeight: 500,
                    color: C.green, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span>{g.emoji}</span> {g.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Journal */}
          {data?.journal ? (
            <div style={{ marginBottom: 20 }}>
              <SectionLabel>Journal</SectionLabel>
              <div style={{ background: '#EEF4FB', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <BookOpen size={16} color={C.muted} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: C.text }}>{data.journal}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Photos */}
          {photos.length > 0 && (
            <div>
              <SectionLabel>Photos</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {photos.map(p => (
                  <img key={p.id} src={p.base64} alt="" style={{
                    width: 90, height: 90, objectFit: 'cover', borderRadius: 14,
                    boxShadow: C.shadow,
                  }} />
                ))}
              </div>
            </div>
          )}

          {!data && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: C.muted }}>
              <Image size={32} color="#D5CFC9" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: 14 }}>No data for this day yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Calendar() {
  const { user } = useAuth();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [allDays, setAllDays] = useState({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekGoals, setWeekGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, 'users', user.uid, 'days')).then(snap => {
      const data = {};
      snap.forEach(d => { data[d.id] = d.data(); });
      setAllDays(data);
    });
  }, [user?.uid, year, month]);

  const getWeekStart = (offset) => {
    const now = new Date();
    const mon = new Date(now);
    mon.setDate(now.getDate() - ((now.getDay()+6)%7) + offset*7);
    mon.setHours(0,0,0,0);
    return mon;
  };
  const weekStart = getWeekStart(weekOffset);
  const weekKey = getWeekKey(weekStart);
  const weekLabel = weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week'
    : weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid, 'weeklyGoals', weekKey))
      .then(snap => setWeekGoals(snap.exists() ? (snap.data().goals||[]) : []));
  }, [user?.uid, weekKey]);

  const saveWeekGoals = async (goals) => {
    setWeekGoals(goals);
    await setDoc(doc(db, 'users', user.uid, 'weeklyGoals', weekKey), { goals });
  };

  const addWeekGoal = async () => {
    if (!newGoal.trim()) return;
    await saveWeekGoals([...weekGoals, { id: Date.now(), text: newGoal.trim(), completed: false }]);
    setNewGoal('');
  };

  const deleteWeekGoal = async (id) => {
    await saveWeekGoals(weekGoals.filter(g => g.id !== id));
  };

  const startEdit = (g) => { setEditingId(g.id); setEditingText(g.text); };

  const commitEdit = async (id) => {
    if (!editingText.trim()) return;
    await saveWeekGoals(weekGoals.map(g => g.id === id ? { ...g, text: editingText.trim() } : g));
    setEditingId(null);
    setEditingText('');
  };

  // Build grid
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay = ((new Date(year, month, 1).getDay()+6)%7);
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = firstDay-1; i >= 0; i--) cells.push({ day: prevMonthDays-i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length-daysInMonth-firstDay+1, current: false });

  const todayStr = toDateStr();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, textAlign: 'center' }}>
        Calendar
      </h1>

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setViewDate(new Date(year,month-1,1))} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: C.muted }}>
          <ChevronLeft size={22} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{monthLabel}</span>
        <button onClick={() => setViewDate(new Date(year,month+1,1))} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: C.muted }}>
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: -8 }}>
        {['M','T','W','T','F','S','S'].map((d,i) => (
          <div key={i} style={{ fontSize: 12, fontWeight: 600, color: C.muted, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
        {cells.map((cell, i) => {
          if (!cell.current) return (
            <div key={i} style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#D5CFC9' }}>{cell.day}</div>
          );
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(cell.day).padStart(2,'0')}`;
          const data = allDays[dateStr];
          const pct = data?.completionPercent;
          const color = getHeatColor(pct);
          const isToday = dateStr === todayStr;

          return (
            <button key={i} onClick={() => setSelectedDate(dateStr)} style={{
              aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: color || '#fff',
              color: color ? '#fff' : '#1A1A1A',
              boxShadow: color ? '0 2px 8px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
              outline: isToday ? `2.5px solid ${C.green}` : 'none',
              outlineOffset: isToday ? 2 : 0,
              transition: 'transform 0.1s',
            }}>
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
        {[['#E8756A','0%'],['#E8A84A','50%'],['#4A7C59','100%']].map(([color,label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Weekly Goals */}
      <div>
        <SectionLabel>Weekly Goals</SectionLabel>
        <div style={{ background: C.card, borderRadius: 20, boxShadow: C.shadow, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
            <button onClick={() => setWeekOffset(o=>o-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4 }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{weekLabel}</span>
            <button onClick={() => setWeekOffset(o=>o+1)} disabled={weekOffset>=0}
              style={{ background: 'none', border: 'none', cursor: weekOffset>=0 ? 'default':'pointer', color: C.muted, padding: 4, opacity: weekOffset>=0?0.3:1 }}>
              <ChevronRight size={18} />
            </button>
          </div>
          <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {weekGoals.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Toggle checkbox */}
                <button onClick={() => saveWeekGoals(weekGoals.map(wg => wg.id===g.id?{...wg,completed:!wg.completed}:wg))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: g.completed ? 'none' : '2px solid #D5CFC9',
                    background: g.completed ? C.green : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {g.completed && <svg width="10" height="10" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
                  </div>
                </button>

                {/* Text or inline edit input */}
                {editingId === g.id ? (
                  <>
                    <input
                      autoFocus
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') commitEdit(g.id); if (e.key === 'Escape') setEditingId(null); }}
                      style={{ flex: 1, background: '#EBF2FA', border: 'none', borderRadius: 10,
                        padding: '6px 10px', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                    />
                    <button onClick={() => commitEdit(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.green }}>
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.muted }}>
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, fontSize: 14, color: g.completed ? C.muted : C.text,
                      textDecoration: g.completed ? 'line-through' : 'none' }}>{g.text}</span>
                    <button onClick={() => startEdit(g)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.muted, opacity: 0.6 }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteWeekGoal(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#E8756A', opacity: 0.7 }}>
                      <X size={15} />
                    </button>
                  </>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <input value={newGoal} onChange={e=>setNewGoal(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&addWeekGoal()}
                placeholder="Add a goal for this week…"
                style={{ flex: 1, background: '#EBF2FA', border: 'none', borderRadius: 12, padding: '10px 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
              <button onClick={addWeekGoal} style={{
                width: 38, height: 38, borderRadius: 12, background: C.green,
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(74,124,89,0.3)',
              }}>
                <Plus size={18} color="#fff" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedDate && (
        <DayDetailSheet dateStr={selectedDate} onClose={() => setSelectedDate(null)} allDays={allDays} />
      )}

      <div style={{ height: 8 }} />
    </div>
  );
}
