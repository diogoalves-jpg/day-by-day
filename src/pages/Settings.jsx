import { useState, useEffect } from 'react';
import { Heart, Info, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';
import { GOALS } from '../lib/goals';

const C = {
  card: '#FFFFFF', green: '#4A7C59',
  border: 'rgba(0,0,0,0.07)', shadow: '0 2px 12px rgba(0,0,0,0.06)',
  muted: '#9C9490', text: '#1A1A1A',
};

function Card({ children, style={} }) {
  return <div style={{ background:C.card, borderRadius:20, boxShadow:C.shadow,
    border:`1px solid ${C.border}`, overflow:'hidden', ...style }}>{children}</div>;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const { descriptions, loading, saveDescriptions } = useSettings();
  const [local, setLocal] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!loading) setLocal({...descriptions}); }, [loading]);

  const handleBlur = async () => {
    await saveDescriptions(local);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  const initials = user?.displayName?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'?';

  const inputStyle = {
    width: '100%', background: '#F5F0EB', border: `1px solid ${C.border}`,
    borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none',
    fontFamily: 'inherit', color: C.text, transition: 'border-color 0.2s',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:28, fontWeight:700, textAlign:'center' }}>
        Settings
      </h1>

      {/* Profile */}
      <Card>
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px' }}>
          <div style={{
            width:46, height:46, borderRadius:'50%', background:'#E8F2EC',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:15, fontWeight:700, color:C.green, overflow:'hidden', flexShrink:0,
          }}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              : initials}
          </div>
          <div>
            <p style={{ fontWeight:700, fontSize:16 }}>{user?.displayName||'User'}</p>
            <p style={{ fontSize:13, color:C.muted, marginTop:1 }}>{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card>
        <div style={{ padding:'16px 18px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <Heart size={16} color="#E74C3C" fill="#E74C3C"/>
            <span style={{ fontWeight:600, fontSize:14 }}>About</span>
          </div>
          <p style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>
            Your personal wellbeing journal. Track daily goals, write reflections, and capture moments that matter. All your data is completely private.
          </p>
        </div>
      </Card>

      {/* Goal Descriptions */}
      <Card>
        <div style={{ padding:'18px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Info size={16} color={C.muted}/>
              <span style={{ fontWeight:600, fontSize:14 }}>Goal Descriptions</span>
            </div>
            {saved && <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>Saved ✓</span>}
          </div>
          <p style={{ fontSize:12, color:C.muted, marginBottom:18, lineHeight:1.5 }}>
            Define what "complete" means for each goal.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {GOALS.map(goal => (
              <div key={goal.id}>
                <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, fontWeight:600, marginBottom:8 }}>
                  <span style={{ fontSize:18 }}>{goal.emoji}</span> {goal.label}
                </label>
                <input
                  style={inputStyle}
                  value={local[goal.id]||''}
                  onChange={e=>setLocal(p=>({...p,[goal.id]:e.target.value}))}
                  onBlur={handleBlur}
                  placeholder={`What does "${goal.label}" mean to you?`}
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Sign out */}
      <button onClick={signOut} style={{
        width:'100%', padding:'16px', background:C.card,
        border:`1px solid rgba(231,76,60,0.2)`, borderRadius:20,
        fontSize:15, fontWeight:600, color:'#E74C3C', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        boxShadow:C.shadow,
      }}>
        <LogOut size={18}/> Sign Out
      </button>

      <div style={{ height:8 }}/>
    </div>
  );
}
