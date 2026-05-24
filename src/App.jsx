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
      alert(`Đồng bộ dữ liệu thất bại: ${err.message || 'Lỗi kết nối máy chủ.'}\nĐã quay về chế độ ngoại tuyến (Local DB).`);
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
    </PhoneSimulator>
  );
}
