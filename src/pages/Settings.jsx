import { useState, useEffect } from 'react';
import { Heart, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';
import { GOALS } from '../lib/goals';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { descriptions, loading, saveDescriptions } = useSettings();
  const [local, setLocal] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading) setLocal({ ...descriptions });
  }, [loading]);

  const handleChange = (id, value) => {
    setLocal((prev) => ({ ...prev, [id]: value }));
  };

  const handleBlur = async () => {
    await saveDescriptions(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = user?.displayName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
        Settings
      </h1>

      {/* Profile */}
      <div className="bg-white border border-[#E8E3DE] rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#E8E3DE] flex items-center justify-center text-sm font-semibold text-[#4A7C59]">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
          ) : initials}
        </div>
        <div>
          <p className="font-semibold text-[#1A1A1A]">{user?.displayName || 'User'}</p>
          <p className="text-sm text-[#888880]">{user?.email}</p>
        </div>
      </div>

      {/* About */}
      <div className="bg-white border border-[#E8E3DE] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Heart size={16} className="text-[#E74C3C]" />
          <span className="font-semibold text-sm">About</span>
        </div>
        <p className="text-sm text-[#888880]">
          Your personal wellbeing journal. Track daily goals, write reflections, and capture moments that matter.
          All your data is completely private.
        </p>
      </div>

      {/* Goal descriptions */}
      <div className="bg-white border border-[#E8E3DE] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-[#888880]" />
            <span className="font-semibold text-sm">Goal Descriptions</span>
          </div>
          {saved && <span className="text-xs text-[#4A7C59]">Saved</span>}
        </div>
        <p className="text-xs text-[#888880] mb-4">Define what "complete" means for each goal (personal reference only).</p>

        <div className="space-y-4">
          {GOALS.map((goal) => (
            <div key={goal.id}>
              <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                <span>{goal.emoji}</span>
                <span>{goal.label}</span>
              </label>
              <input
                className="w-full bg-[#F5F0EB] border border-[#E8E3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4A7C59]/50 transition-colors"
                value={local[goal.id] || ''}
                onChange={(e) => handleChange(goal.id, e.target.value)}
                onBlur={handleBlur}
                placeholder={`What does "${goal.label}" mean to you?`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full py-3 rounded-2xl border border-[#E8E3DE] bg-white text-sm font-medium text-[#E74C3C] hover:bg-red-50 transition-colors"
      >
        Sign Out
      </button>

      <div className="h-4" />
    </div>
  );
}
