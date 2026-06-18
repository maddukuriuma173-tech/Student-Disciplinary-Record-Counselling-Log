import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  FilePlus2, 
  BarChart3, 
  Sun, 
  Moon 
} from 'lucide-react';

const Navigation = ({ user, onLogout, activeTab, onNavigate, theme, onToggleTheme }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'new', label: 'Add Case', icon: <FilePlus2 size={18} /> },
    { id: 'reports', label: 'Analytics', icon: <BarChart3 size={18} /> }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
        <div style={{
          backgroundColor: 'hsl(var(--accent-primary))',
          padding: '0.5rem',
          borderRadius: '8px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShieldAlert size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', lineHeight: '1.2' }}>Gowthami</h2>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>Disciplinary Log</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
        {navItems.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(item.id);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.925rem',
              fontWeight: activeTab === item.id || (item.id === 'dashboard' && activeTab.startsWith('record/')) ? '600' : '500',
              color: activeTab === item.id || (item.id === 'dashboard' && activeTab.startsWith('record/')) 
                ? 'hsl(var(--text-primary))' 
                : 'hsl(var(--text-secondary))',
              backgroundColor: activeTab === item.id || (item.id === 'dashboard' && activeTab.startsWith('record/'))
                ? 'rgba(255,255,255,0.03)'
                : 'transparent',
              border: activeTab === item.id || (item.id === 'dashboard' && activeTab.startsWith('record/'))
                ? '1px solid var(--glass-border)'
                : '1px solid transparent',
              transition: 'all 0.2s'
            }}
            className="nav-link"
          >
            <span style={{ color: activeTab === item.id || (item.id === 'dashboard' && activeTab.startsWith('record/')) 
              ? 'hsl(var(--accent-primary))' 
              : 'hsl(var(--text-muted))'
            }}>
              {item.icon}
            </span>
            {item.label}
          </a>
        ))}
      </nav>

      {/* Theme Toggler & Footer */}
      <div style={{ borderTop: '1px solid hsl(var(--border-color))', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {user && (
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.username}</span>
              <span className="sidebar-user-email">{user.email}</span>
            </div>
          </div>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="btn btn-secondary btn-sidebar-logout"
            style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}
          >
            Sign Out
          </button>
        )}

        <button
          onClick={onToggleTheme}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={16} /> Light Mode
            </>
          ) : (
            <>
              <Moon size={16} /> Dark Mode
            </>
          )}
        </button>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
          Sri Gowthami Edu Institutions &copy; 2026
        </div>
      </div>
    </aside>
  );
};

export default Navigation;
