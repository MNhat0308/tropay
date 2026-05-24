import React, { useState } from 'react';
import { Plus, X, Trash2, Edit2, Phone, MessageCircle, Calendar, Search } from 'lucide-react';

export default function Tenants({ tenants, rooms, onSaveTenant, onDeleteTenant }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  // Bộ lọc tìm kiếm nhanh
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTenants = tenants.filter(t => {
    const rName = rooms.find(r => r.id === t.room_id)?.name || '';
    const query = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      (t.phone && t.phone.toLowerCase().includes(query)) ||
      (t.identification && t.identification.toLowerCase().includes(query)) ||
      rName.toLowerCase().includes(query)
    );
  });

  // Form states
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Nam');
  const [identification, setIdentification] = useState('');
  const [address, setAddress] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [note, setNote] = useState('');

  const handleOpenAdd = () => {
    if (rooms.length === 0) {
      window.showAlert('Vui lòng tạo ít nhất một phòng trọ trong tab "Phòng trọ" trước khi thêm khách thuê!', 'THIẾU PHÒNG TRỌ', 'warning');
      return;
    }
    setName('');
    // Tìm phòng trống đầu tiên để gán mặc định nếu có
    const vacantRoom = rooms.find(r => r.status === 'vacant');
    setRoomId(vacantRoom ? vacantRoom.id.toString() : (rooms[0]?.id.toString() || ''));
    setPhone('');
    setDob('1998-01-01');
    setGender('Nam');
    setIdentification('');
    setAddress('');
    setStart(new Date().toISOString().split('T')[0]);
    setEnd(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
    setNote('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (tenant) => {
    setEditingTenant(tenant);
    setName(tenant.name);
    setRoomId(tenant.room_id.toString());
    setPhone(tenant.phone || '');
    setDob(tenant.dob || '');
    setGender(tenant.gender || 'Nam');
    setIdentification(tenant.identification || '');
    setAddress(tenant.address || '');
    setStart(tenant.start || '');
    setEnd(tenant.end || '');
    setNote(tenant.note || '');
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomId || rooms.length === 0) {
      window.showAlert('Vui lòng tạo phòng trọ trong tab "Phòng trọ" trước khi thêm khách thuê!', 'THIẾU PHÒNG TRỌ', 'warning');
      return;
    }
    const payload = {
      name,
      room_id: Number(roomId),
      phone,
      dob,
      gender,
      identification,
      address,
      start,
      end,
      note,
    };
    
    if (editingTenant) {
      payload.id = editingTenant.id;
    }
    
    onSaveTenant(payload);
    setShowAddModal(false);
    setEditingTenant(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách thuê này? Trạng thái phòng liên quan sẽ đổi về trống.')) {
      onDeleteTenant(id);
    }
  };

  // Lấy tên phòng từ room_id
  const getRoomName = (rId) => {
    return rooms.find(r => r.id === rId)?.name || 'Chưa gán phòng';
  };

  return (
    <div style={styles.container} className="animate-slide-up">
      {/* Nút thêm khách nổi bật ở trên */}
      <div style={styles.topBar}>
        <span style={styles.countText}>Tổng số: {tenants.length} khách thuê</span>
        <button onClick={handleOpenAdd} style={styles.addBtn} className="tap-effect">
          <Plus size={16} /> Thêm khách thuê
        </button>
      </div>

      {/* Thanh Tìm kiếm nhanh */}
      <div style={styles.searchSection}>
        <div style={styles.searchBox}>
          <Search size={16} color="var(--text-muted)" style={{ marginLeft: '10px' }} />
          <input
            type="text"
            placeholder="Tìm theo tên khách, phòng, SĐT, CCCD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.searchClearBtn} className="tap-effect">
              <X size={14} color="var(--text-muted)" />
            </button>
          )}
        </div>
      </div>

      {/* Danh sách khách thuê */}
      <div style={styles.list}>
        {filteredTenants.length > 0 ? (
          filteredTenants.map((tenant) => (
            <div key={tenant.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.avatarGroup}>
                  <div style={styles.avatar}>
                    {tenant.name.split(' ').pop().charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={styles.tenantName}>{tenant.name}</h4>
                    <span style={styles.roomBadge}>{getRoomName(tenant.room_id)}</span>
                  </div>
                </div>
                
                <div style={styles.actionsRight}>
                  <button onClick={() => handleOpenEdit(tenant)} style={styles.iconBtn} className="tap-effect">
                    <Edit2 size={13} color="var(--text-muted)" />
                  </button>
                  <button onClick={() => handleDelete(tenant.id)} style={styles.iconBtn} className="tap-effect">
                    <Trash2 size={13} color="#f43f5e" />
                  </button>
                </div>
              </div>

              <div style={styles.cardContent}>
                <div style={styles.infoRow}>
                  <Phone size={12} color="var(--text-muted)" />
                  <span style={styles.infoText}>{tenant.phone || 'Chưa cập nhật'}</span>
                </div>
                <div style={styles.infoRow}>
                  <Calendar size={12} color="var(--text-muted)" />
                  <span style={styles.infoText}>
                    Hợp đồng: {tenant.start ? new Date(tenant.start).toLocaleDateString('vi-VN') : 'N/A'} - {tenant.end ? new Date(tenant.end).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
                {tenant.note && (
                  <div style={styles.noteBox}>
                    <span style={styles.noteText}>Ghi chú: {tenant.note}</span>
                  </div>
                )}
              </div>

              {/* Các nút bấm liên hệ nhanh */}
              <div style={styles.contactActions}>
                <a href={`tel:${tenant.phone}`} style={styles.contactBtnPhone} className="tap-effect">
                  <Phone size={14} /> Gọi điện
                </a>
                <a href={`https://zalo.me/${tenant.phone}`} target="_blank" rel="noopener noreferrer" style={styles.contactBtnZalo} className="tap-effect">
                  <MessageCircle size={14} /> Zalo
                </a>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Không có khách thuê nào khớp bộ lọc.</p>
          </div>
        )}
      </div>

      {/* Modal Thêm / Sửa khách thuê */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal} className="animate-slide-up">
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{editingTenant ? 'Sửa Thông Tin Khách' : 'Thêm Khách Thuê Mới'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingTenant(null); }} style={styles.closeBtn} className="tap-effect">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Họ và tên khách</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={styles.select}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Chọn phòng thuê</label>
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    style={styles.select}
                  >
                    {[...rooms].sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true})).map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} {room.status === 'vacant' ? '(Trống)' : '(Đang thuê)'}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Ngày sinh</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Số CMND/CCCD</label>
                <input
                  type="text"
                  placeholder="Nhập 12 số CCCD"
                  value={identification}
                  onChange={(e) => setIdentification(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Quê quán (Hộ khẩu thường trú)</label>
                <input
                  type="text"
                  placeholder="Địa chỉ quê quán"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Ngày bắt đầu hợp đồng</label>
                  <input
                    type="date"
                    required
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Ngày kết thúc hợp đồng</label>
                  <input
                    type="date"
                    required
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Ghi chú thêm</label>
                <textarea
                  placeholder="Ví dụ: Đóng cọc 1 tháng tiền phòng..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ ...styles.input, height: '60px', resize: 'none' }}
                />
              </div>

              <button type="submit" style={styles.submitBtn} className="tap-effect">
                {editingTenant ? 'Cập nhật hợp đồng' : 'Ký hợp đồng thuê'}
              </button>
            </form>
          </div>
        </div>
      )}
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
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--primary)',
    border: 'none',
    borderRadius: '10px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    cursor: 'pointer',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: '16px',
    padding: '16px',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  avatarGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  tenantName: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  roomBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--primary)',
    display: 'inline-block',
    marginTop: '2px',
  },
  actionsRight: {
    display: 'flex',
    gap: '8px',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    borderTop: '1px solid var(--border-light)',
    paddingTop: '10px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  infoText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  noteBox: {
    marginTop: '4px',
    padding: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    borderLeft: '2px solid rgba(255, 255, 255, 0.1)',
  },
  noteText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  contactActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: '6px',
  },
  contactBtnPhone: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '10px',
    padding: '8px',
    color: 'var(--primary)',
    fontSize: '12px',
    fontWeight: '700',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  contactBtnZalo: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '10px',
    padding: '8px',
    color: 'var(--accent)',
    fontSize: '12px',
    fontWeight: '700',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(5, 7, 12, 0.8)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 999,
  },
  modal: {
    width: '100%',
    backgroundColor: 'var(--bg-app)',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    borderTop: '1px solid var(--border-light)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '85%',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
    fontFamily: 'var(--font-heading)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '12px',
  },
  formLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
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
  select: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '8px 12px',
    color: 'var(--text-main)',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
  },
  submitBtn: {
    backgroundColor: 'var(--primary)',
    color: 'var(--text-inverse)',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 12px var(--primary-glow)',
  },
  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '4px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    height: '36px',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-main)',
    fontSize: '13px',
    padding: '0 32px 0 8px',
  },
  searchClearBtn: {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    outline: 'none',
  },
  emptyState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '30px 10px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: '16px',
    width: '100%',
  }
};
