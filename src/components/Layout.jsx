import { NavLink, Outlet } from 'react-router-dom';
import { Home, Calendar, BarChart2, Settings } from 'lucide-react';

const navItems = [
  { to: '/',         label: 'Today',    Icon: Home },
  { to: '/calendar', label: 'Calendar', Icon: Calendar },
  { to: '/recap',    label: 'Recap',    Icon: BarChart2 },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

const NAV_HEIGHT = 64;

export default function Layout() {
  return (
    <div style={{ backgroundColor: '#F5F0EB', minHeight: '100dvh' }}>
      <div
        style={{
          maxWidth: 512,
          margin: '0 auto',
          padding: `16px 16px calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom) + 16px) 16px`,
          paddingTop: `calc(16px + env(safe-area-inset-top))`,
        }}
      >
        <Outlet />
      </div>

      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTop: '1px solid #E8E3DE',
          zIndex: 50,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div style={{ maxWidth: 512, margin: '0 auto', display: 'flex', height: NAV_HEIGHT }}>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textDecoration: 'none', fontSize: 11, fontWeight: 500 }}
              className={({ isActive }) => isActive ? 'text-green-700' : 'text-gray-400'}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} color={isActive ? '#4A7C59' : '#888880'} />
                  <span style={{ color: isActive ? '#4A7C59' : '#888880' }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
