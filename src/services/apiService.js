import { getSyncConfig, saveSyncConfig } from '../db/database';

// API Service kết nối trực tiếp đến Laravel Backend của bạn
export const apiService = {
  // Lấy cấu hình đồng bộ hiện tại
  getConfig() {
    return getSyncConfig();
  },

  // Đăng nhập Laravel để lấy Token Sanctum
  async login(email, password) {
    const config = this.getConfig();
    try {
      const response = await fetch(`${config.apiUrl.replace(/\/$/, '')}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.');
      }

      const data = await response.json();
      const updatedConfig = {
        ...config,
        enabled: true,
        token: data.token || data.access_token || ''
      };
      saveSyncConfig(updatedConfig);
      return { success: true, config: updatedConfig };
    } catch (error) {
      console.error('API Login Error:', error);
      return { success: false, message: error.message };
    }
  },

  // Đăng xuất và xóa cấu hình đồng bộ
  logout() {
    const config = this.getConfig();
    const updatedConfig = {
      ...config,
      enabled: false,
      token: ''
    };
    saveSyncConfig(updatedConfig);
    return updatedConfig;
  },

  // Gửi request có kèm token Sanctum
  async request(endpoint, method = 'GET', body = null) {
    const config = this.getConfig();
    if (!config.enabled || !config.token) {
      throw new Error('Đồng bộ API chưa được kích hoạt hoặc chưa đăng nhập.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${config.token}`
    };

    const options = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const url = `${config.apiUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    const response = await fetch(url, options);

    if (response.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      this.logout();
      throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Lỗi máy chủ (${response.status})`);
    }

    return await response.json();
  },

  // --- CÁC API ĐỒNG BỘ ---

  // Tải danh sách phòng từ Laravel
  async fetchRooms() {
    try {
      const data = await this.request('/rooms');
      return data.data || data;
    } catch (error) {
      console.error('Fetch Rooms Error:', error);
      throw error;
    }
  },

  // Đồng bộ (lưu) một phòng lên Laravel
  async syncRoom(room) {
    try {
      const method = room.id ? 'PUT' : 'POST';
      const endpoint = room.id ? `/rooms/${room.id}` : '/rooms';
      return await this.request(endpoint, method, room);
    } catch (error) {
      console.error('Sync Room Error:', error);
      throw error;
    }
  },

  // Tải danh sách khách thuê từ Laravel
  async fetchTenants() {
    try {
      const data = await this.request('/tenants');
      return data.data || data;
    } catch (error) {
      console.error('Fetch Tenants Error:', error);
      throw error;
    }
  },

  // Đồng bộ một khách thuê lên Laravel
  async syncTenant(tenant) {
    try {
      const method = tenant.id ? 'PUT' : 'POST';
      const endpoint = tenant.id ? `/tenants/${tenant.id}` : '/tenants';
      return await this.request(endpoint, method, tenant);
    } catch (error) {
      console.error('Sync Tenant Error:', error);
      throw error;
    }
  },

  // Tải danh sách hóa đơn từ Laravel
  async fetchBills() {
    try {
      const data = await this.request('/bill-rooms');
      return data.data || data;
    } catch (error) {
      console.error('Fetch Bills Error:', error);
      throw error;
    }
  },

  // Đồng bộ (gửi) hóa đơn lên Laravel
  async syncBill(bill) {
    try {
      // Định dạng lại các trường nếu cần khớp hoàn toàn với Laravel API
      const payload = {
        room_id: Number(bill.room_id),
        rent_month: Number(bill.rent_month),
        old_electric: Number(bill.old_electric),
        new_electric: Number(bill.new_electric),
        electric_consumption: Number(bill.electric_consumption),
        old_water: Number(bill.old_water),
        new_water: Number(bill.new_water),
        water_consumption: Number(bill.water_consumption),
        price_room: Number(bill.price_room),
        price_water: Number(bill.price_water),
        price_electric: Number(bill.price_electric),
        price_garbage: Number(bill.price_garbage),
        total_price: Number(bill.total_price),
        note: bill.note || '',
        at: bill.at || new Date().toISOString()
      };

      const method = bill.id ? 'PUT' : 'POST';
      const endpoint = bill.id ? `/bill-rooms/${bill.id}` : '/bill-rooms';
      return await this.request(endpoint, method, payload);
    } catch (error) {
      console.error('Sync Bill Error:', error);
      throw error;
    }
  }
};
