import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0EB] px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo / title */}
        <div>
          <div className="text-5xl mb-4">📅</div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Day by Day
          </h1>
          <p className="text-[#888880] mt-2 text-sm">
            Your personal wellbeing journal
          </p>
        </div>

        {/* Sign in card */}
        <div className="bg-white border border-[#E8E3DE] rounded-2xl p-6 space-y-4">
          <p className="text-sm text-[#888880]">Track daily goals, write reflections, and capture moments that matter.</p>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#4A7C59] text-white rounded-xl font-medium hover:bg-[#3d6b4c] transition-colors"
          >
            <LogIn size={18} />
            Continue with Google
          </button>
        </div>

        <p className="text-xs text-[#C0BBB5]">Your data is private and synced across all your devices.</p>
      </div>
    </div>
  );
}
