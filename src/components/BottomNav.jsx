import React from 'react';
import { LayoutDashboard, Key, Users, Receipt, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Trang chủ', icon: LayoutDashboard },
    { id: 'rooms', label: 'Phòng trọ', icon: Key },
    { id: 'tenants', label: 'Khách thuê', icon: Users },
    { id: 'bills', label: 'Hóa đơn', icon: Receipt },
    { id: 'settings', label: 'Cấu hình', icon: Settings },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.navBar}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={styles.tabButton}
              className="tap-effect"
            >
              <div style={{
                ...styles.iconContainer,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
              }}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && <div style={styles.activeDot} />}
              </div>
              <span style={{
                ...styles.label,
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: isActive ? '600' : '400',
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '66px',
    backgroundColor: 'var(--bg-card)',
    backdropFilter: 'blur(16px)',
    borderTop: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 900,
    paddingBottom: '2px',
  },
  navBar: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: '450px',
  },
  tabButton: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    width: '20%',
    height: '100%',
    gap: '4px',
  },
  iconContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'color 0.2s, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  activeDot: {
    position: 'absolute',
    bottom: '-6px',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    boxShadow: '0 0 8px var(--primary)',
  },
  label: {
    fontSize: '10px',
    letterSpacing: '-0.1px',
    transition: 'color 0.2s',
    fontFamily: 'var(--font-sans)',
  }
};
