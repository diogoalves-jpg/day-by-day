import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { toDateStr } from '../lib/goals';

function getHeatColor(percent) {
  if (percent === undefined || percent === null) return null;
  if (percent === 0) return '#E74C3C';
  if (percent < 50) return '#E8A838';
  if (percent < 80) return '#A8C840';
  return '#4A7C59';
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  // 0=Sun..6=Sat → convert to Mon-based 0-6
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

function getWeekKey(date) {
  const d = new Date(date);
  // ISO week: Monday-based
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const wk = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(wk).padStart(2, '0')}`;
}

export default function Calendar() {
  const { user } = useAuth();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [dayData, setDayData] = useState({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekGoals, setWeekGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Load all days for this month
  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, 'users', user.uid, 'days');
    getDocs(colRef).then((snap) => {
      const data = {};
      snap.forEach((d) => { data[d.id] = d.data(); });
      setDayData(data);
    });
  }, [user?.uid, year, month]);

  // Compute current viewed week
  const getWeekStart = (offset) => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const weekStart = getWeekStart(weekOffset);
  const weekKey = getWeekKey(weekStart);

  const weekLabel = (() => {
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === -1) return 'Last Week';
    return weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  })();

  // Load weekly goals
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'weeklyGoals', weekKey);
    getDoc(ref).then((snap) => {
      setWeekGoals(snap.exists() ? (snap.data().goals || []) : []);
    });
  }, [user?.uid, weekKey]);

  const saveWeekGoals = async (goals) => {
    setWeekGoals(goals);
    const ref = doc(db, 'users', user.uid, 'weeklyGoals', weekKey);
    await setDoc(ref, { goals });
  };

  const addWeekGoal = async () => {
    if (!newGoal.trim()) return;
    await saveWeekGoals([...weekGoals, { id: Date.now(), text: newGoal.trim(), completed: false }]);
    setNewGoal('');
  };

  const toggleWeekGoal = async (id) => {
    await saveWeekGoals(weekGoals.map((g) => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = [];

  // Prev month padding
  const prevMonthDays = getDaysInMonth(year, month - 1 < 0 ? 11 : month - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - daysInMonth - firstDay + 1, current: false });
  }

  const todayStr = toDateStr();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
        Calendar
      </h1>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-2 text-[#888880] hover:text-[#1A1A1A]">
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold text-[#1A1A1A]">{monthLabel}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-2 text-[#888880] hover:text-[#1A1A1A]">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-[#888880] mb-1">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.current) {
            return <div key={i} className="aspect-square flex items-center justify-center text-sm text-[#C0BBB5]">{cell.day}</div>;
          }
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
          const data = dayData[dateStr];
          const pct = data?.completionPercent;
          const hasData = pct !== undefined;
          const isToday = dateStr === todayStr;
          const color = hasData ? getHeatColor(pct) : null;

          return (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center text-sm font-medium rounded-xl transition-all ${
                isToday ? 'ring-2 ring-[#4A7C59] ring-offset-1' : ''
              }`}
              style={color ? { backgroundColor: color, color: '#fff' } : { color: '#1A1A1A' }}
            >
              {cell.day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-[#888880]">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E74C3C] inline-block" /> 0%</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#A8C840] inline-block" /> 50%</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#4A7C59] inline-block" /> 100%</span>
      </div>

      {/* Weekly Goals */}
      <div>
        <p className="text-xs font-semibold text-[#888880] tracking-widest uppercase mb-3">Weekly Goals</p>
        <div className="bg-white border border-[#E8E3DE] rounded-2xl overflow-hidden">
          {/* Week nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E3DE]">
            <button onClick={() => setWeekOffset((o) => o - 1)} className="p-1 text-[#888880] hover:text-[#1A1A1A]">
              <ChevronLeft size={18} />
            </button>
            <span className="font-semibold text-sm">{weekLabel}</span>
            <button
              onClick={() => setWeekOffset((o) => o + 1)}
              disabled={weekOffset >= 0}
              className="p-1 text-[#888880] hover:text-[#1A1A1A] disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Goals list */}
          <div className="p-3 space-y-2">
            {weekGoals.map((g) => (
              <button
                key={g.id}
                onClick={() => toggleWeekGoal(g.id)}
                className="w-full flex items-center gap-3 text-left"
              >
                <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  g.completed ? 'bg-[#4A7C59] border-[#4A7C59]' : 'border-[#C0BBB5]'
                }`}>
                  {g.completed && <span className="text-white text-[10px] font-bold">✓</span>}
                </span>
                <span className={`text-sm ${g.completed ? 'line-through text-[#888880]' : 'text-[#1A1A1A]'}`}>{g.text}</span>
              </button>
            ))}

            {/* Add goal input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                className="flex-1 bg-[#F5F0EB] rounded-xl px-3 py-2 text-sm placeholder-[#C0BBB5] focus:outline-none focus:ring-1 focus:ring-[#4A7C59]/40"
                placeholder="Add a goal for this week…"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addWeekGoal()}
              />
              <button
                onClick={addWeekGoal}
                className="w-8 h-8 rounded-full bg-[#4A7C59] flex items-center justify-center text-white hover:bg-[#3d6b4c] transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
