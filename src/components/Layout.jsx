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
    <div style={{ background: '#E8F0FA', minHeight: '100dvh' }}>
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '0 16px',
        paddingTop: 'calc(20px + env(safe-area-inset-top))',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
      }}>
        <Outlet />
      </div>

      {/* Bottom Nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 100,
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', height: 60 }}>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                       justifyContent: 'center', gap: 3, textDecoration: 'none' }}>
              {({ isActive }) => (<>
                <Icon size={21} strokeWidth={isActive ? 2.2 : 1.6} color={isActive ? '#4A7C59' : '#B0A99F'} />
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
                               color: isActive ? '#4A7C59' : '#B0A99F' }}>{label}</span>
              </>)}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
