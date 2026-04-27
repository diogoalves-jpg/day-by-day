import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Flame, BookOpen, Camera } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { GOALS } from '../lib/goals';

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function computeStats(allDays, year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const days = Object.entries(allDays)
    .filter(([k]) => k.startsWith(prefix))
    .map(([, v]) => v);

  const perfectDays = days.filter((d) => (d.completionPercent || 0) >= 80).length;
  const journalEntries = days.filter((d) => d.journal && d.journal.trim()).length;
  const photos = days.reduce((s, d) => s + (d.photos?.length || 0), 0);

  // Best streak across entire history (not just this month)
  const allDates = Object.keys(allDays).sort();
  let bestStreak = 0, cur = 0;
  for (let i = 0; i < allDates.length; i++) {
    if ((allDays[allDates[i]].completionPercent || 0) > 0) {
      cur++;
      if (cur > bestStreak) bestStreak = cur;
    } else {
      cur = 0;
    }
  }

  const goalDays = {};
  GOALS.forEach((g) => {
    goalDays[g.id] = days.filter((d) => d.goals?.[g.id]).length;
  });

  const avgPercent = days.length
    ? Math.round(days.reduce((s, d) => s + (d.completionPercent || 0), 0) / days.length)
    : 0;

  return { perfectDays, journalEntries, photos, bestStreak, goalDays, avgPercent, totalDays: days.length };
}

const COMPARE_OPTIONS = [
  { value: 'overall',  label: 'Overall performance' },
  { value: 'mental',   label: '🧠 Mental Wellbeing' },
  { value: 'workout',  label: '💪 Working Out' },
  { value: 'eating',   label: '🥗 Eating Healthy' },
  { value: 'water',    label: '💧 Drinking Water' },
  { value: 'walking',  label: '🚶 Walking' },
  { value: 'sleep',    label: '😴 Sleeping Well' },
  { value: 'reading',  label: '📖 Reading' },
];

function CompareBar({ label, value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#888880] w-16 text-right">{label}</span>
      <div className="flex-1 h-3 bg-[#F5F0EB] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium w-8">{value}{max === 100 ? '%' : 'd'}</span>
    </div>
  );
}

export default function Recap() {
  const { user } = useAuth();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [allDays, setAllDays] = useState({});
  const [compareA, setCompareA] = useState(getMonthKey(new Date(today.getFullYear(), today.getMonth() - 1, 1)));
  const [compareB, setCompareB] = useState(getMonthKey(new Date(today.getFullYear(), today.getMonth() - 2, 1)));
  const [compareBy, setCompareBy] = useState('overall');

  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, 'users', user.uid, 'days')).then((snap) => {
      const data = {};
      snap.forEach((d) => { data[d.id] = d.data(); });
      setAllDays(data);
    });
  }, [user?.uid]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const stats = computeStats(allDays, year, month);

  // Month selector options
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    monthOptions.push({ value: getMonthKey(d), label: getMonthLabel(d) });
  }

  const getCompareValue = (dateStr, metric) => {
    const [y, m] = dateStr.split('-').map(Number);
    const s = computeStats(allDays, y, m - 1);
    if (metric === 'overall') return s.avgPercent;
    return s.goalDays[metric] || 0;
  };

  const valA = getCompareValue(compareA, compareBy);
  const valB = getCompareValue(compareB, compareBy);
  const isPercent = compareBy === 'overall';
  const maxVal = isPercent ? 100 : Math.max(valA, valB, 1);

  const labelA = monthOptions.find((o) => o.value === compareA)?.label || compareA;
  const labelB = monthOptions.find((o) => o.value === compareB)?.label || compareB;

  const noDataA = getCompareValue(compareA, 'overall') === 0 && computeStats(allDays, ...compareA.split('-').map((v,i) => i===1?Number(v)-1:Number(v))).totalDays === 0;
  const noDataB = getCompareValue(compareB, 'overall') === 0 && computeStats(allDays, ...compareB.split('-').map((v,i) => i===1?Number(v)-1:Number(v))).totalDays === 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
        Monthly Recap
      </h1>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-2 text-[#888880] hover:text-[#1A1A1A]">
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold text-[#1A1A1A]">{getMonthLabel(viewDate)}</span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          disabled={getMonthKey(viewDate) >= getMonthKey(today)}
          className="p-2 text-[#888880] hover:text-[#1A1A1A] disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-[#E8E3DE] rounded-2xl p-4">
          <Trophy size={20} className="text-[#4A7C59] mb-2" />
          <p className="text-3xl font-bold">{stats.perfectDays}</p>
          <p className="text-sm font-medium text-[#1A1A1A]">Perfect Days</p>
          <p className="text-xs text-[#888880]">≥ 80% completed</p>
        </div>
        <div className="bg-white border border-[#E8E3DE] rounded-2xl p-4">
          <Flame size={20} className="text-orange-400 mb-2" />
          <p className="text-3xl font-bold">{stats.bestStreak}</p>
          <p className="text-sm font-medium text-[#1A1A1A]">Best Streak</p>
          <p className="text-xs text-[#888880]">active days in a row</p>
        </div>
        <div className="bg-white border border-[#E8E3DE] rounded-2xl p-4">
          <BookOpen size={20} className="text-blue-400 mb-2" />
          <p className="text-3xl font-bold">{stats.journalEntries}</p>
          <p className="text-sm font-medium text-[#1A1A1A]">Journal Entries</p>
          <p className="text-xs text-[#888880]">reflections written</p>
        </div>
        <div className="bg-white border border-[#E8E3DE] rounded-2xl p-4">
          <Camera size={20} className="text-purple-400 mb-2" />
          <p className="text-3xl font-bold">{stats.photos}</p>
          <p className="text-sm font-medium text-[#1A1A1A]">Photos</p>
          <p className="text-xs text-[#888880]">moments captured</p>
        </div>
      </div>

      {/* Goal completion */}
      <div>
        <p className="text-xs font-semibold text-[#888880] tracking-widest uppercase mb-3">Goal Completion</p>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <div key={g.id} className="bg-white border border-[#E8E3DE] rounded-xl p-3 flex items-center gap-3">
              <span className="text-xl">{g.emoji}</span>
              <div>
                <p className="text-xs text-[#888880]">{g.label}</p>
                <p className="font-semibold text-sm">{stats.goalDays[g.id] ?? 0} days</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Month Comparison */}
      <div>
        <p className="text-xs font-semibold text-[#888880] tracking-widest uppercase mb-3">Month Comparison</p>
        <div className="bg-white border border-[#E8E3DE] rounded-2xl p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-[#888880] mb-1 uppercase tracking-wide">Month A</p>
              <select
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
                className="w-full bg-[#F5F0EB] border border-[#E8E3DE] rounded-xl px-3 py-2 text-sm focus:outline-none"
              >
                {monthOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-[#888880] mb-1 uppercase tracking-wide">Month B</p>
              <select
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
                className="w-full bg-[#F5F0EB] border border-[#E8E3DE] rounded-xl px-3 py-2 text-sm focus:outline-none"
              >
                {monthOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs text-[#888880] mb-1 uppercase tracking-wide">Compare by</p>
            <select
              value={compareBy}
              onChange={(e) => setCompareBy(e.target.value)}
              className="w-full bg-[#F5F0EB] border border-[#E8E3DE] rounded-xl px-3 py-2 text-sm focus:outline-none"
            >
              {COMPARE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {noDataA && noDataB ? (
            <p className="text-sm text-[#888880] text-center py-2">No data for the selected months.</p>
          ) : (
            <div className="space-y-3 pt-1">
              <CompareBar label={labelA.split(' ')[0]} value={valA} max={maxVal} color="#4A7C59" />
              <CompareBar label={labelB.split(' ')[0]} value={valB} max={maxVal} color="#A8C840" />
            </div>
          )}
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
