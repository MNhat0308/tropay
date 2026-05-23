import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function ScreenWrapper({ title, onBack, rightAction, children, scrollable = true }) {
  return (
    <div style={styles.wrapper} className="animate-fade-in">
      {/* Thanh Tiêu đề (Header) mô phỏng native app */}
      <div style={styles.header}>
        <div style={styles.leftContainer}>
          {onBack && (
            <button onClick={onBack} style={styles.iconButton} className="tap-effect">
              <ArrowLeft size={22} color="#f8fafc" />
            </button>
          )}
        </div>
        
        <h1 style={styles.title}>{title}</h1>
        
        <div style={styles.rightContainer}>
          {rightAction || <div style={{ width: 22 }} />}
        </div>
      </div>

      {/* Nội dung bên dưới */}
      <div style={{ ...styles.content, overflowY: scrollable ? 'auto' : 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a', // Nền ứng dụng sâu thẳm
    position: 'relative',
  },
  header: {
    height: '56px',
    minHeight: '56px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  leftContainer: {
    width: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rightContainer: {
    width: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: '-0.3px',
    fontFamily: 'var(--font-heading)',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    paddingBottom: '80px', // Khoảng trống cho BottomNav
    boxSizing: 'border-box',
  }
};
