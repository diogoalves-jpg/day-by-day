import { useState, useRef } from 'react';
import { Camera, X, Check } from 'lucide-react';
import { GOALS, getGreeting, toDateStr, formatDisplayDate } from '../lib/goals';
import { useDay } from '../hooks/useDay';
import { useSettings } from '../hooks/useSettings';
import { compressImage } from '../lib/imageUtils';

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

  if (loading) return <div className="flex items-center justify-center h-64 text-[#888880]">Loading…</div>;

  const journalValue = journalText !== '' ? journalText : (day?.journal || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <p className="text-sm text-[#888880] font-medium">{formatDisplayDate()}</p>
          <h1 className="text-2xl font-bold mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
            {getGreeting()}
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-[#E8E3DE] bg-white">
          <span className="text-lg font-bold text-[#1A1A1A] leading-none">{percent}%</span>
          <span className="text-[10px] text-[#888880] mt-0.5">Today</span>
        </div>
      </div>

      {/* Daily Goals */}
      <div>
        <p className="text-xs font-semibold text-[#888880] tracking-widest uppercase mb-3">Daily Goals</p>
        <div className="space-y-2">
          {GOALS.map((goal) => {
            const done = !!goals[goal.id];
            return (
              <button
                key={goal.id}
                onClick={() => updateGoal(goal.id, !done)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                  done
                    ? 'bg-[#4A7C59]/10 border-[#4A7C59]/30'
                    : 'bg-white border-[#E8E3DE] hover:border-[#4A7C59]/40'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                  done ? 'bg-[#4A7C59]/15' : 'bg-[#F5F0EB]'
                }`}>
                  {done ? <Check size={18} className="text-[#4A7C59]" strokeWidth={2.5} /> : goal.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${done ? 'text-[#4A7C59] line-through opacity-70' : 'text-[#1A1A1A]'}`}>
                    {goal.label}
                  </p>
                  <p className="text-xs text-[#888880] truncate">{descriptions[goal.id]}</p>
                </div>
                {done && <Check size={16} className="text-[#4A7C59] flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Journal */}
      <div>
        <p className="text-xs font-semibold text-[#888880] tracking-widest uppercase mb-3 flex items-center gap-2">
          📖 Journal
          {journalSaved && <span className="text-[#4A7C59] font-normal normal-case tracking-normal">Saved</span>}
        </p>
        <textarea
          className="w-full bg-white border border-[#E8E3DE] rounded-2xl p-4 text-sm text-[#1A1A1A] placeholder-[#C0BBB5] resize-none focus:outline-none focus:border-[#4A7C59]/50 transition-colors"
          rows={4}
          placeholder="How was your day? Write a few words…"
          value={journalValue}
          onChange={(e) => setJournalText(e.target.value)}
          onBlur={handleJournalBlur}
        />
      </div>

      {/* Photos */}
      <div>
        <p className="text-xs font-semibold text-[#888880] tracking-widest uppercase mb-3">📷 Photos</p>
        <div className="flex flex-wrap gap-2">
          {(day?.photos || []).map((photo) => (
            <div key={photo.id} className="relative w-24 h-24 rounded-xl overflow-hidden group">
              <img src={photo.base64} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-[#E8E3DE] flex flex-col items-center justify-center gap-1 text-[#888880] hover:border-[#4A7C59]/50 hover:text-[#4A7C59] transition-colors disabled:opacity-50"
          >
            <Camera size={20} />
            <span className="text-[10px]">{uploading ? 'Saving…' : 'Add photo'}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
