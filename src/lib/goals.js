export const GOALS = [
  { id: 'mental',  label: 'Mental Wellbeing', emoji: '🧠' },
  { id: 'workout', label: 'Working Out',       emoji: '💪' },
  { id: 'eating',  label: 'Eating Healthy',    emoji: '🥗' },
  { id: 'water',   label: 'Drinking Water',    emoji: '💧' },
  { id: 'walking', label: 'Walking',           emoji: '🚶' },
  { id: 'sleep',   label: 'Sleeping Well',     emoji: '😴' },
  { id: 'reading', label: 'Reading',           emoji: '📖' },
];

export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export const toDateStr = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatDisplayDate = (date = new Date()) =>
  date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
