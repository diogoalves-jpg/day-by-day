import { NavLink, Outlet } from 'react-router-dom';
import { Home, Calendar, BarChart2, Settings } from 'lucide-react';

const navItems = [
  { to: '/',         label: 'Today',    Icon: Home },
  { to: '/calendar', label: 'Calendar', Icon: Calendar },
  { to: '/recap',    label: 'Recap',    Icon: BarChart2 },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh]">
      {/* Top safe area */}
      <div style={{ paddingTop: 'env(safe-area-inset-top)', backgroundColor: '#F5F0EB' }} />

      <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto px-4 pt-4"
            style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E3DE] z-50"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-lg mx-auto flex items-center justify-around h-16">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors ${
                  isActive ? 'text-[#4A7C59]' : 'text-[#888880]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
