import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Flame, BookOpen, Camera } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { GOALS } from '../lib/goals';

// Get the Monday date of a given ISO week key "YYYY-Www"
function weekKeyToMonday(weekKey) {
  const [yearStr, wStr] = weekKey.split('-W');
  const year = Number(yearStr), week = Number(wStr);
  const jan4 = new Date(year, 0, 4);
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (week - 1) * 7);
  return monday;
}

function weekBelongsToMonth(weekKey, year, month) {
  const monday = weekKeyToMonday(weekKey);
  return monday.getFullYear() === year && monday.getMonth() === month;
}

const C = {
  card: '#FFFFFF', green: '#4A7C59',
  border: 'rgba(0,0,0,0.07)', shadow: '0 2px 12px rgba(0,0,0,0.06)',
  muted: '#9C9490', text: '#1A1A1A',
};

function getMonthKey(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
function getMonthLabel(d) { return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); }

function computeStats(allDays, allWeeklyGoals, year, month) {
  const prefix = `${year}-${String(month+1).padStart(2,'0')}`;
  const days = Object.entries(allDays).filter(([k])=>k.startsWith(prefix)).map(([,v])=>v);
  const perfectDays = days.filter(d=>(d.completionPercent||0)>=80).length;
  const journalEntries = days.filter(d=>d.journal?.trim()).length;
  const photos = days.reduce((s,d)=>s+(d.photos?.length||0),0);
  const allDates = Object.keys(allDays).sort();
  let best=0,cur=0;
  allDates.forEach(date => {
    if((allDays[date].completionPercent||0)>0){cur++;if(cur>best)best=cur;}else cur=0;
  });
  const goalDays = {};
  GOALS.forEach(g => { goalDays[g.id]=days.filter(d=>d.goals?.[g.id]).length; });
  const avg = days.length ? Math.round(days.reduce((s,d)=>s+(d.completionPercent||0),0)/days.length) : 0;

  // Count completed weekly goals for weeks whose Monday falls in this month
  const weeklyGoalsCompleted = Object.entries(allWeeklyGoals)
    .filter(([wk]) => weekBelongsToMonth(wk, year, month))
    .reduce((sum, [, data]) => sum + (data.goals||[]).filter(g=>g.completed).length, 0);

  return { perfectDays, journalEntries, photos, bestStreak: best, goalDays, avgPercent: avg, totalDays: days.length, weeklyGoalsCompleted };
}

function SectionLabel({ children }) {
  return <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
    textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>{children}</p>;
}

function StatCard({ icon, value, label, sub, color = C.green }) {
  return (
    <div style={{ background: C.card, borderRadius: 20, boxShadow: C.shadow,
                  border: `1px solid ${C.border}`, padding: '18px 16px' }}>
      <div style={{ color, marginBottom: 10 }}>{icon}</div>
      <p style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{label}</p>
      <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</p>
    </div>
  );
}

const COMPARE_OPTIONS = [
  { value: 'overall', label: 'Overall performance' },
  { value: 'weeklyGoals', label: '✅ Weekly goals completed' },
  ...GOALS.map(g => ({ value: g.id, label: `${g.emoji} ${g.label}` })),
];

export default function Recap() {
  const { user } = useAuth();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [allDays, setAllDays] = useState({});
  const [allWeeklyGoals, setAllWeeklyGoals] = useState({});
  const [compareA, setCompareA] = useState(getMonthKey(new Date(today.getFullYear(), today.getMonth()-1, 1)));
  const [compareB, setCompareB] = useState(getMonthKey(new Date(today.getFullYear(), today.getMonth()-2, 1)));
  const [compareBy, setCompareBy] = useState('overall');

  useEffect(() => {
    if (!user) return;
    getDocs(collection(db,'users',user.uid,'days')).then(snap => {
      const d = {}; snap.forEach(s=>{d[s.id]=s.data();}); setAllDays(d);
    });
    getDocs(collection(db,'users',user.uid,'weeklyGoals')).then(snap => {
      const d = {}; snap.forEach(s=>{d[s.id]=s.data();}); setAllWeeklyGoals(d);
    });
  }, [user?.uid]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const stats = computeStats(allDays, allWeeklyGoals, year, month);

  const monthOptions = Array.from({length:12},(_,i)=>{
    const d = new Date(today.getFullYear(), today.getMonth()-i, 1);
    return { value: getMonthKey(d), label: getMonthLabel(d) };
  });

  const getVal = (dateStr, metric) => {
    const [y,m] = dateStr.split('-').map(Number);
    const s = computeStats(allDays, allWeeklyGoals, y, m-1);
    if (metric === 'overall') return s.avgPercent;
    if (metric === 'weeklyGoals') return s.weeklyGoalsCompleted;
    return s.goalDays[metric] || 0;
  };

  const valA = getVal(compareA, compareBy);
  const valB = getVal(compareB, compareBy);
  const isPercent = compareBy === 'overall';
  const maxVal = isPercent ? 100 : Math.max(valA,valB,1);
  const labelA = monthOptions.find(o=>o.value===compareA)?.label?.split(' ')[0]||compareA;
  const labelB = monthOptions.find(o=>o.value===compareB)?.label?.split(' ')[0]||compareB;

  const selectStyle = {
    width: '100%', background: '#F5F0EB', border: `1px solid ${C.border}`,
    borderRadius: 12, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit',
    outline: 'none', color: C.text, appearance: 'none', WebkitAppearance: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, textAlign: 'center' }}>
        Monthly Recap
      </h1>

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={()=>setViewDate(new Date(year,month-1,1))} style={{ background:'none',border:'none',padding:8,cursor:'pointer',color:C.muted }}><ChevronLeft size={22}/></button>
        <span style={{ fontWeight:700,fontSize:16 }}>{getMonthLabel(viewDate)}</span>
        <button onClick={()=>setViewDate(new Date(year,month+1,1))} disabled={getMonthKey(viewDate)>=getMonthKey(today)}
          style={{ background:'none',border:'none',padding:8,cursor:'pointer',color:C.muted,opacity:getMonthKey(viewDate)>=getMonthKey(today)?0.3:1 }}><ChevronRight size={22}/></button>
      </div>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <StatCard icon={<Trophy size={22}/>} value={stats.perfectDays} label="Perfect Days" sub="≥ 80% completed" color="#4A7C59"/>
        <StatCard icon={<Flame size={22}/>} value={stats.bestStreak} label="Best Streak" sub="active days in a row" color="#F97316"/>
        <StatCard icon={<BookOpen size={22}/>} value={stats.journalEntries} label="Journal Entries" sub="reflections written" color="#3B82F6"/>
        <StatCard icon={<Camera size={22}/>} value={stats.photos} label="Photos" sub="moments captured" color="#A855F7"/>
      </div>

      {/* Goal completion */}
      <div>
        <SectionLabel>Goal Completion</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {GOALS.map(g => (
            <div key={g.id} style={{ background:C.card, borderRadius:16, boxShadow:C.shadow,
              border:`1px solid ${C.border}`, padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:22 }}>{g.emoji}</span>
              <div>
                <p style={{ fontSize:12, color:C.muted, marginBottom:2 }}>{g.label}</p>
                <p style={{ fontSize:16, fontWeight:700 }}>{stats.goalDays[g.id]??0} <span style={{ fontSize:12,fontWeight:400,color:C.muted }}>days</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Month comparison */}
      <div>
        <SectionLabel>Month Comparison</SectionLabel>
        <div style={{ background:C.card, borderRadius:20, boxShadow:C.shadow, border:`1px solid ${C.border}`, padding:'16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div>
              <p style={{ fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,letterSpacing:0.8,textTransform:'uppercase' }}>Month A</p>
              <select value={compareA} onChange={e=>setCompareA(e.target.value)} style={selectStyle}>
                {monthOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <p style={{ fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,letterSpacing:0.8,textTransform:'uppercase' }}>Month B</p>
              <select value={compareB} onChange={e=>setCompareB(e.target.value)} style={selectStyle}>
                {monthOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,letterSpacing:0.8,textTransform:'uppercase' }}>Compare by</p>
            <select value={compareBy} onChange={e=>setCompareBy(e.target.value)} style={selectStyle}>
              {COMPARE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Bars */}
          {[{label:labelA,val:valA,color:'#4A7C59'},{label:labelB,val:valB,color:'#A8C840'}].map(({label,val,color})=>(
            <div key={label} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13,fontWeight:600 }}>{label}</span>
                <span style={{ fontSize:13,fontWeight:700,color }}>{val}{isPercent?'%':'d'}</span>
              </div>
              <div style={{ height:10,background:'#F2EDE8',borderRadius:10,overflow:'hidden' }}>
                <div style={{ height:'100%',width:`${maxVal?(val/maxVal)*100:0}%`,background:color,borderRadius:10,transition:'width 0.5s ease' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}
