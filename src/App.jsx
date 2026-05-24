import React, { useState, useEffect } from 'react';
import PhoneSimulator from './components/PhoneSimulator';
import ScreenWrapper from './components/ScreenWrapper';
import BottomNav from './components/BottomNav';
import PasscodeLock from './components/PasscodeLock';

// Nạp các Views chính
import Dashboard from './views/Dashboard';
import Rooms from './views/Rooms';
import Tenants from './views/Tenants';
import Bills from './views/Bills';
import Settings from './views/Settings';

// Nạp dịch vụ DB ngoại tuyến & API
import {
  initDB,
  resetDB,
  getRooms,
  saveRoom,
  deleteRoom,
  getTenants,
  saveTenant,
  deleteTenant,
  getBills,
  saveBill,
  deleteBill,
  getSyncConfig,
  saveSyncConfig
} from './db/database';
import { apiService } from './services/apiService';

import './App.css';

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('tropay_theme') || 'dark'
  );
  
  // Áp dụng lớp CSS và lưu cấu hình giao diện
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('tropay_theme', theme);
  }, [theme]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUnlocked, setIsUnlocked] = useState(
    sessionStorage.getItem('tropay_unlocked') === 'true'
  );

  // Cấu hình Dialog & Toast thông minh toàn cục
  const [alertConfig, setAlertConfig] = useState(null);
  const [toastConfig, setToastConfig] = useState(null);

  useEffect(() => {
    window.showAlert = (message, title = 'THÔNG BÁO', type = 'info', onClose = null) => {
      setAlertConfig({ title, message, type, onClose });
    };
    window.showToast = (message, type = 'success') => {
      setToastConfig({ message, type });
    };
  }, []);

  // Tự động tắt Toast sau 3 giây
  useEffect(() => {
    if (toastConfig) {
      const timer = setTimeout(() => setToastConfig(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastConfig]);

  // Trạng thái cơ sở dữ liệu
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [bills, setBills] = useState([]);
  const [syncConfig, setSyncConfig] = useState(null);

  // Khởi chạy cơ sở dữ liệu lúc khởi động app
  useEffect(() => {
    initDB();
    setRooms(getRooms());
    setTenants(getTenants());
    setBills(getBills());
    
    const config = getSyncConfig();
    setSyncConfig(config);
    if (config?.enabled) {
      fetchLiveData(config);
    }
  }, []);

  // Hàm tải dữ liệu thực tế từ máy chủ Laravel API
  const fetchLiveData = async (config) => {
    if (!config || !config.enabled || !config.token) return;
    try {
      console.log("Đang tải dữ liệu thực tế từ Laravel API...");
      const liveRooms = await apiService.fetchRooms();
      const liveTenants = await apiService.fetchTenants();
      const liveBills = await apiService.fetchBills();
      
      // Ghi đè vào cache LocalStorage để chạy mượt mà lúc mất mạng
      localStorage.setItem('tropay_rooms', JSON.stringify(liveRooms));
      localStorage.setItem('tropay_tenants', JSON.stringify(liveTenants));
      localStorage.setItem('tropay_bills', JSON.stringify(liveBills));
      
      // Cập nhật lại State giao diện React
      setRooms(liveRooms);
      setTenants(liveTenants);
      setBills(liveBills);
      console.log("✅ Đồng bộ dữ liệu thành công từ core.house-bill.test!");
    } catch (err) {
      console.error("Lỗi đồng bộ API Laravel:", err);
      // Khi lỗi đồng bộ xảy ra (mất mạng hoặc token hết hạn), thực hiện logout để đưa cấu hình về offline
      const updatedConfig = apiService.logout();
      setSyncConfig(updatedConfig);
      window.showAlert(`Đồng bộ dữ liệu thất bại: ${err.message || 'Lỗi kết nối máy chủ.'}\nĐã quay về chế độ ngoại tuyến (Local DB).`, 'ĐỒNG BỘ THẤT BẠI', 'error');
    }
  };

  // Tự động tải lại dữ liệu khi cấu hình đồng bộ thay đổi
  useEffect(() => {
    if (syncConfig?.enabled) {
      fetchLiveData(syncConfig);
    }
  }, [syncConfig?.enabled, syncConfig?.token]);

  // --- HÀM XỬ LÝ CHO PHÒNG TRỌ (ROOMS) ---
  const handleSaveRoom = (roomData) => {
    const updated = saveRoom(roomData);
    setRooms(updated);
    
    // Nếu chế độ đồng bộ API hoạt động, đồng bộ trực tiếp lên Laravel backend
    if (syncConfig?.enabled) {
      apiService.syncRoom(roomData).catch(err => console.error("Sync Room Failed:", err));
    }
  };

  const handleDeleteRoom = (id) => {
    const updated = deleteRoom(id);
    setRooms(updated);
  };

  // --- HÀM XỬ LÝ KHÁCH THUÊ (TENANTS) ---
  const handleSaveTenant = (tenantData) => {
    const updated = saveTenant(tenantData);
    setTenants(updated);

    // Cập nhật lại danh sách phòng (do trạng thái trống/đầy thay đổi)
    setRooms(getRooms());

    if (syncConfig?.enabled) {
      apiService.syncTenant(tenantData).catch(err => console.error("Sync Tenant Failed:", err));
    }
  };

  const handleDeleteTenant = (id) => {
    const updated = deleteTenant(id);
    setTenants(updated);
    setRooms(getRooms());
  };

  // --- HÀM XỬ LÝ HÓA ĐƠN (BILLS) ---
  const handleSaveBill = (billData) => {
    const updated = saveBill(billData);
    setBills(updated);

    if (syncConfig?.enabled) {
      apiService.syncBill(billData)
        .then(() => console.log("Đã đồng bộ hóa đơn lên Laravel thành công!"))
        .catch(err => console.error("Lỗi đồng bộ hóa đơn lên Laravel:", err));
    }
  };

  const handleDeleteBill = (id) => {
    const updated = deleteBill(id);
    setBills(updated);
  };

  // --- HÀM HỆ THỐNG (SETTINGS & RESET) ---
  const handleUpdateSyncConfig = (config) => {
    const updated = saveSyncConfig(config);
    setSyncConfig(updated);
  };

  const handleResetData = () => {
    const res = resetDB();
    setRooms(res.rooms);
    setTenants(res.tenants);
    setBills(res.bills);
  };

  // Lấy tiêu đề tương ứng theo tab
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'TroPay Mobile';
      case 'rooms':
        return 'Danh Sách Phòng Trọ';
      case 'tenants':
        return 'Quản Lý Khách Thuê';
      case 'bills':
        return 'Tính Tiền Điện Nước';
      case 'settings':
        return 'Cấu Hình & Hệ Thống';
      default:
        return 'TroPay';
    }
  };

  // Hàm chuyển đổi nội dung hiển thị theo tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            rooms={rooms}
            tenants={tenants}
            bills={bills}
            setActiveTab={setActiveTab}
          />
        );
      case 'rooms':
        return (
          <Rooms
            rooms={rooms}
            onSaveRoom={handleSaveRoom}
            onDeleteRoom={handleDeleteRoom}
          />
        );
      case 'tenants':
        return (
          <Tenants
            tenants={tenants}
            rooms={rooms}
            onSaveTenant={handleSaveTenant}
            onDeleteTenant={handleDeleteTenant}
          />
        );
      case 'bills':
        return (
          <Bills
            bills={bills}
            rooms={rooms}
            onSaveBill={handleSaveBill}
            onDeleteBill={handleDeleteBill}
          />
        );
      case 'settings':
        return (
          <Settings
            syncConfig={syncConfig}
            onUpdateSyncConfig={handleUpdateSyncConfig}
            onResetData={handleResetData}
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PhoneSimulator>
      {!isUnlocked ? (
        <PasscodeLock onUnlock={() => {
          sessionStorage.setItem('tropay_unlocked', 'true');
          setIsUnlocked(true);
        }} />
      ) : (
        <>
          <ScreenWrapper title={getTabTitle()} scrollable={true}>
            {renderTabContent()}
          </ScreenWrapper>
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
      )}

      {/* Reusable Premium Custom Dialog & Toast */}
      {alertConfig && (
        <CustomAlertDialog
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => {
            if (alertConfig.onClose) alertConfig.onClose();
            setAlertConfig(null);
          }}
        />
      )}
      {toastConfig && (
        <CustomToast
          message={toastConfig.message}
          type={toastConfig.type}
        />
      )}
    </PhoneSimulator>
  );
}

// --- COMPONENT THÔNG BÁO DIALOG CAO CẤP ---
function CustomAlertDialog({ title, message, type, onClose }) {
  return (
    <div style={alertStyles.overlay} className="animate-fade-in">
      <div style={alertStyles.card} className="animate-slide-up">
        <div style={alertStyles.header}>
          <span style={alertStyles.emoji}>
            {type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '🔔'}
          </span>
          <h3 style={alertStyles.title}>{title}</h3>
        </div>
        <p style={alertStyles.message}>{message}</p>
        <button onClick={onClose} style={alertStyles.closeBtn} className="tap-effect">
          ĐỒNG Ý
        </button>
      </div>
    </div>
  );
}

// --- COMPONENT TOAST THÔNG BÁO NHANH ---
function CustomToast({ message, type }) {
  return (
    <div style={alertStyles.toastContainer} className="animate-fade-in">
      <div style={{
        ...alertStyles.toastCard,
        borderLeft: type === 'error' ? '4px solid #f43f5e' : '4px solid var(--primary)',
      }}>
        <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
          {type === 'error' ? '❌' : '✅'}
        </span>
        <span style={alertStyles.toastText}>{message}</span>
      </div>
    </div>
  );
}

const alertStyles = {
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(5, 7, 12, 0.65)',
    backdropFilter: 'blur(8px)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: '300px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  emoji: {
    fontSize: '32px',
    marginBottom: '4px',
  },
  title: {
    fontSize: '13px',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '0.5px',
    fontFamily: 'var(--font-heading)',
    textTransform: 'uppercase',
  },
  message: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    margin: '4px 0 8px 0',
    whiteSpace: 'pre-line',
  },
  closeBtn: {
    width: '100%',
    backgroundColor: 'var(--primary)',
    color: 'var(--text-inverse)',
    border: 'none',
    borderRadius: '12px',
    padding: '10px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 10px var(--primary-glow)',
  },
  toastContainer: {
    position: 'absolute',
    top: '56px',
    left: '16px',
    right: '16px',
    zIndex: 99998,
    display: 'flex',
    justifyContent: 'center',
  },
  toastCard: {
    width: '100%',
    maxWidth: '320px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(16px)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxSizing: 'border-box',
  },
  toastText: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-main)',
    lineHeight: '1.4',
    textAlign: 'left',
  }
};
