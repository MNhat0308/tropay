import React, { useState } from 'react';
import { ShieldAlert, Delete } from 'lucide-react';

const CORRECT_PIN = '2026';

export default function PasscodeLock({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleKeyPress = (num) => {
    if (pin.length >= 4) return;
    setErrorMsg('');
    const newPin = pin + num;
    setPin(newPin);

    // Kiểm tra ngay khi nhập đủ 4 số
    if (newPin.length === 4) {
      if (newPin === CORRECT_PIN) {
        setTimeout(() => {
          onUnlock();
        }, 200);
      } else {
        setTimeout(() => {
          setPin('');
          setErrorMsg('❌ Mã PIN không chính xác. Vui lòng thử lại!');
        }, 250);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length === 0) return;
    setPin(pin.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  return (
    <div style={styles.overlay} className="animate-fade-in">
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconBg}>
            <ShieldAlert size={28} color="var(--primary)" />
          </div>
          <h2 style={styles.title}>BẢO MẬT ỨNG DỤNG</h2>
          <p style={styles.subtitle}>Nhập mã khóa để truy cập hệ thống TroPay</p>
        </div>

        {/* Các chấm hiển thị số lượng mã đã nhập */}
        <div style={styles.dotsRow}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              style={{
                ...styles.dot,
                backgroundColor: pin.length > index ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: pin.length > index ? '0 0 10px var(--primary)' : 'none',
                transform: pin.length > index ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        {/* Bàn phím số */}
        <div style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              style={styles.keyBtn}
              className="tap-effect"
            >
              {num}
            </button>
          ))}
          <button onClick={handleClear} style={styles.keyBtnAux} className="tap-effect">
            C
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            style={styles.keyBtn}
            className="tap-effect"
          >
            0
          </button>
          <button onClick={handleBackspace} style={styles.keyBtnAux} className="tap-effect">
            <Delete size={18} />
          </button>
        </div>

        <div style={styles.tip}>
          <span>💡 Mã khóa mặc định: <strong>2026</strong></span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#090d16',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  iconBg: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  title: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: '1px',
    fontFamily: 'var(--font-heading)',
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    padding: '0 10px',
  },
  dotsRow: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    margin: '10px 0',
  },
  dot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '1.5px solid var(--border-light)',
    transition: 'all 0.15s ease',
  },
  errorBox: {
    color: '#f43f5e',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    padding: '8px 16px',
    borderRadius: '8px',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box',
    animation: 'shake 0.3s ease-in-out',
  },
  keypad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '14px',
    width: '100%',
    justifyItems: 'center',
  },
  keyBtn: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: '1px solid var(--border-light)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: '#f8fafc',
    fontSize: '20px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    transition: 'all 0.1s ease',
    fontFamily: 'var(--font-heading)',
  },
  keyBtnAux: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
  },
  tip: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '8px',
  }
};
