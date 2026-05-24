import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, Radio, Wifi, ShieldCheck, HelpCircle, Sun, Moon } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function Settings({ syncConfig, onUpdateSyncConfig, onResetData, theme, onToggleTheme }) {
  const [enabled, setEnabled] = useState(syncConfig?.enabled || false);
  const [apiUrl, setApiUrl] = useState(syncConfig?.apiUrl || 'http://core.house-bill.test/api');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (syncConfig) {
      setEnabled(syncConfig.enabled);
      setApiUrl(syncConfig.apiUrl);
    }
  }, [syncConfig]);

  const handleConnectSync = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');

    // Cập nhật cấu hình URL trước
    onUpdateSyncConfig({
      ...syncConfig,
      apiUrl,
      enabled: false // Tạm thời false đến khi đăng nhập thành công
    });

    try {
      // Gọi dịch vụ đăng nhập lấy token từ Laravel Backend của người dùng
      setStatusMsg('Đang gửi yêu cầu xác thực tới Laravel...');
      const res = await apiService.login(email, password);

      if (res.success) {
        onUpdateSyncConfig(res.config);
        setStatusMsg('✅ Kết nối thành công! Đã cấp token đồng bộ từ Laravel.');
      } else {
        setStatusMsg(`❌ Kết nối thất bại: ${res.message || 'Tài khoản hoặc mật khẩu không hợp lệ.'}`);
        onUpdateSyncConfig({
          ...syncConfig,
          apiUrl,
          enabled: false,
          token: ''
        });
      }
    } catch (err) {
      setStatusMsg(`❌ Kết nối thất bại: ${err.message || 'Vui lòng kiểm tra lại máy chủ Laravel.'}`);
      onUpdateSyncConfig({
        ...syncConfig,
        apiUrl,
        enabled: false,
        token: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    const updated = apiService.logout();
    onUpdateSyncConfig(updated);
    setStatusMsg('Đã ngắt kết nối đồng bộ.');
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại cơ sở dữ liệu? Tất cả dữ liệu thêm mới sẽ quay về dữ liệu mẫu mặc định.')) {
      onResetData();
      window.showToast('Đã đặt lại dữ liệu mẫu thành công!', 'success');
    }
  };

  return (
    <div style={styles.container} className="animate-slide-up">
      {/* 0. Giao diện Hệ thống */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🌓 GIAO DIỆN HỆ THỐNG</h3>
        <div style={styles.themeRow}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {theme === 'light' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#38bdf8" />}
            Chế độ giao diện
          </span>
          <button 
            onClick={onToggleTheme}
            style={{
              ...styles.themeToggleBtn,
              backgroundColor: theme === 'light' ? '#e2e8f0' : '#1e293b',
              border: theme === 'light' ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.08)',
            }}
            className="tap-effect"
          >
            <div style={{
              ...styles.themeToggleThumb,
              transform: theme === 'light' ? 'translateX(0px)' : 'translateX(34px)',
              backgroundColor: theme === 'light' ? '#f59e0b' : '#38bdf8',
            }}>
              {theme === 'light' ? <Sun size={12} color="#fff" /> : <Moon size={12} color="#fff" />}
            </div>
            <span style={{
              ...styles.themeToggleText,
              color: theme === 'light' ? '#475569' : '#94a3b8',
              paddingLeft: theme === 'light' ? '30px' : '0px',
              paddingRight: theme === 'light' ? '0px' : '30px',
            }}>
              {theme === 'light' ? 'SÁNG' : 'TỐI'}
            </span>
          </button>
        </div>
      </div>

      {/* 1. Trạng thái kết nối */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🛰️ TRẠNG THÁI KẾT NỐI API</h3>
        <div style={styles.syncStatusRow}>
          <div style={styles.statusIndicator}>
            <div style={{
              ...styles.statusDot,
              backgroundColor: enabled ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: enabled ? '0 0 10px var(--primary)' : 'none'
            }} />
            <span style={{ fontSize: '13px', fontWeight: '700', color: enabled ? 'var(--primary)' : 'var(--text-muted)' }}>
              {enabled ? 'ĐANG ĐỒNG BỘ VỚI LARAVEL' : 'CHẾ ĐỘ OFFLINE'}
            </span>
          </div>
          <span style={styles.badge}>
            {enabled ? 'Online-Sync' : 'Local-DB'}
          </span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Khi chế độ đồng bộ hoạt động, mọi hoạt động tính hóa đơn, sửa giá phòng sẽ tự động đồng bộ thời gian thực về máy chủ Laravel.
        </p>
      </div>

      {/* 2. Cấu hình kết nối Laravel */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>⚙️ CẤU HÌNH LIÊN KẾT MÁY CHỦ</h3>
        
        {!enabled ? (
          <form onSubmit={handleConnectSync} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>API Endpoint URL</label>
              <input
                type="url"
                required
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Tài khoản quản trị (Laravel)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>

            {statusMsg && <div style={styles.statusBox}>{statusMsg}</div>}

            <button type="submit" disabled={loading} style={styles.submitBtn} className="tap-effect">
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" style={{ marginRight: 6 }} /> Đang kết nối...
                </>
              ) : 'Kết nối & Đồng bộ ngay'}
            </button>
          </form>
        ) : (
          <div style={styles.connectedBox}>
            <div style={styles.connectedHeader}>
              <ShieldCheck size={18} color="var(--primary)" />
              <div style={styles.connectedDetails}>
                <strong>Đã kết nối thành công!</strong>
                <span>Endpoint: {apiUrl}</span>
              </div>
            </div>
            {statusMsg && <div style={{ ...styles.statusBox, margin: '8px 0' }}>{statusMsg}</div>}
            <button onClick={handleDisconnect} style={styles.disconnectBtn} className="tap-effect">
              Ngắt kết nối đồng bộ
            </button>
          </div>
        )}
      </div>

      {/* 3. Đặt lại cơ sở dữ liệu mẫu */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>💾 QUẢN TRỊ DỮ LIỆU</h3>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Tải lại toàn bộ dữ liệu mẫu mặc định để trải nghiệm đầy đủ các phòng 101, 102, 202 và các hóa đơn, khách thuê mẫu.
        </p>
        <button onClick={handleReset} style={styles.resetBtn} className="tap-effect">
          <Database size={14} style={{ marginRight: 6 }} /> Nạp lại Dữ liệu mẫu (Reset)
        </button>
      </div>

      {/* 4. Thông tin hệ thống */}
      <div style={styles.systemInfo}>
        <span>TroPay Mobile App v1.0.0</span>
        <span>Phát triển bởi Antigravity AI</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: '16px',
    padding: '16px',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  cardTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-main)',
    letterSpacing: '0.5px',
    fontFamily: 'var(--font-heading)',
  },
  syncStatusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  badge: {
    fontSize: '9px',
    color: 'var(--accent)',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: '2px 8px',
    borderRadius: '6px',
    fontWeight: '700',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderTop: '1px solid var(--border-light)',
    paddingTop: '10px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  formLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '8px 12px',
    color: 'var(--text-main)',
    fontSize: '13px',
    outline: 'none',
  },
  submitBtn: {
    backgroundColor: 'var(--primary)',
    color: 'var(--text-inverse)',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBox: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '11px',
    color: 'var(--text-main)',
    lineHeight: '1.4',
  },
  connectedBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderTop: '1px solid var(--border-light)',
    paddingTop: '10px',
  },
  connectedHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  connectedDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: '12px',
  },
  disconnectBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    color: '#f43f5e',
    borderRadius: '10px',
    padding: '10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  resetBtn: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-light)',
    color: 'var(--text-main)',
    borderRadius: '12px',
    padding: '10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: 'var(--text-muted)',
    marginTop: '10px',
  },
  themeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
  },
  themeToggleBtn: {
    width: '68px',
    height: '30px',
    borderRadius: '15px',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    overflow: 'hidden',
  },
  themeToggleThumb: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: '3px',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
  },
  themeToggleText: {
    fontSize: '9px',
    fontWeight: '800',
    width: '100%',
    textAlign: 'center',
    userSelect: 'none',
    letterSpacing: '0.5px',
    transition: 'all 0.3s ease',
  }
};
