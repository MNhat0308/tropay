import { initialRooms, initialTenants, initialBills } from './mockData';

const KEYS = {
  ROOMS: 'tropay_rooms',
  TENANTS: 'tropay_tenants',
  BILLS: 'tropay_bills',
  SYNC_CONFIG: 'tropay_sync_config'
};

// Khởi động cơ sở dữ liệu và nạp dữ liệu mẫu nếu chưa có gì
export const initDB = () => {
  if (!localStorage.getItem(KEYS.ROOMS)) {
    localStorage.setItem(KEYS.ROOMS, JSON.stringify(initialRooms));
  }
  if (!localStorage.getItem(KEYS.TENANTS)) {
    localStorage.setItem(KEYS.TENANTS, JSON.stringify(initialTenants));
  }
  if (!localStorage.getItem(KEYS.BILLS)) {
    localStorage.setItem(KEYS.BILLS, JSON.stringify(initialBills));
  }
  if (!localStorage.getItem(KEYS.SYNC_CONFIG)) {
    localStorage.setItem(KEYS.SYNC_CONFIG, JSON.stringify({
      enabled: false,
      apiUrl: 'http://core.house-bill.test/api',
      token: ''
    }));
  }
};

// Reset toàn bộ cơ sở dữ liệu về mặc định
export const resetDB = () => {
  localStorage.setItem(KEYS.ROOMS, JSON.stringify(initialRooms));
  localStorage.setItem(KEYS.TENANTS, JSON.stringify(initialTenants));
  localStorage.setItem(KEYS.BILLS, JSON.stringify(initialBills));
  return {
    rooms: initialRooms,
    tenants: initialTenants,
    bills: initialBills
  };
};

// --- QUẢN LÝ PHÒNG TRỌ (ROOMS) ---
export const getRooms = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.ROOMS)) || [];
};

export const saveRoom = (room) => {
  const rooms = getRooms();
  if (room.id) {
    // Cập nhật
    const index = rooms.findIndex(r => r.id === Number(room.id));
    if (index !== -1) {
      rooms[index] = { ...rooms[index], ...room, id: Number(room.id) };
    }
  } else {
    // Tạo mới
    const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
    rooms.push({ ...room, id: newId, status: room.status || 'vacant' });
  }
  localStorage.setItem(KEYS.ROOMS, JSON.stringify(rooms));
  return rooms;
};

export const deleteRoom = (roomId) => {
  let rooms = getRooms();
  rooms = rooms.filter(r => r.id !== Number(roomId));
  localStorage.setItem(KEYS.ROOMS, JSON.stringify(rooms));
  return rooms;
};

// --- QUẢN LÝ KHÁCH THUÊ (TENANTS) ---
export const getTenants = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.TENANTS)) || [];
};

export const saveTenant = (tenant) => {
  const tenants = getTenants();
  if (tenant.id) {
    const index = tenants.findIndex(t => t.id === Number(tenant.id));
    if (index !== -1) {
      tenants[index] = { ...tenants[index], ...tenant, id: Number(tenant.id) };
    }
  } else {
    const newId = tenants.length > 0 ? Math.max(...tenants.map(t => t.id)) + 1 : 1;
    tenants.push({ ...tenant, id: newId, status: tenant.status || 'active' });
  }
  localStorage.setItem(KEYS.TENANTS, JSON.stringify(tenants));
  
  // Cập nhật luôn trạng thái phòng nếu gán phòng mới
  if (tenant.room_id) {
    updateRoomStatus(tenant.room_id, 'occupied');
  }
  
  return tenants;
};

export const deleteTenant = (tenantId) => {
  let tenants = getTenants();
  const tenant = tenants.find(t => t.id === Number(tenantId));
  tenants = tenants.filter(t => t.id !== Number(tenantId));
  localStorage.setItem(KEYS.TENANTS, JSON.stringify(tenants));
  
  // Nếu khách thuê bị xóa, cập nhật lại trạng thái phòng tương ứng thành trống
  if (tenant && tenant.room_id) {
    updateRoomStatus(tenant.room_id, 'vacant');
  }
  
  return tenants;
};

const updateRoomStatus = (roomId, status) => {
  const rooms = getRooms();
  const index = rooms.findIndex(r => r.id === Number(roomId));
  if (index !== -1) {
    rooms[index].status = status;
    localStorage.setItem(KEYS.ROOMS, JSON.stringify(rooms));
  }
};

// --- QUẢN LÝ HÓA ĐƠN (BILLS) ---
export const getBills = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.BILLS)) || [];
};

export const saveBill = (bill) => {
  const bills = getBills();
  if (bill.id) {
    const index = bills.findIndex(b => b.id === Number(bill.id));
    if (index !== -1) {
      bills[index] = { ...bills[index], ...bill, id: Number(bill.id) };
    }
  } else {
    const newId = bills.length > 0 ? Math.max(...bills.map(b => b.id)) + 1 : 1;
    bills.push({ ...bill, id: newId, at: new Date().toISOString() });
  }
  localStorage.setItem(KEYS.BILLS, JSON.stringify(bills));
  return bills;
};

export const deleteBill = (billId) => {
  let bills = getBills();
  bills = bills.filter(b => b.id !== Number(billId));
  localStorage.setItem(KEYS.BILLS, JSON.stringify(bills));
  return bills;
};

// --- QUẢN LÝ CẤU HÌNH ĐỒNG BỘ API (SYNC CONFIG) ---
export const getSyncConfig = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.SYNC_CONFIG));
};

export const saveSyncConfig = (config) => {
  localStorage.setItem(KEYS.SYNC_CONFIG, JSON.stringify(config));
  return config;
};
