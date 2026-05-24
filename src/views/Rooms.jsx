import React, { useState } from 'react';
import { Plus, X, Trash2, Edit2, ShieldAlert } from 'lucide-react';

export default function Rooms({ rooms, onSaveRoom, onDeleteRoom }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  
  // Các state cho form nhập liệu
  const [name, setName] = useState('');
  const [priceRoom, setPriceRoom] = useState('');
  const [priceWater, setPriceWater] = useState('15000');
  const [priceElectric, setPriceElectric] = useState('3500');
  const [priceGarbage, setPriceGarbage] = useState('50000');
  const [status, setStatus] = useState('vacant');

  const handleOpenAdd = () => {
    setName(`Phòng ${rooms.length + 101}`);
    setPriceRoom('3500000');
    setPriceWater('15000');
    setPriceElectric('3500');
    setPriceGarbage('50000');
    setStatus('vacant');
    setShowAddModal(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setName(room.name);
    setPriceRoom(room.price_room.toString());
    setPriceWater(room.price_water.toString());
    setPriceElectric(room.price_electric.toString());
    setPriceGarbage(room.price_garbage.toString());
    setStatus(room.status);
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name,
      price_room: Number(priceRoom),
      price_water: Number(priceWater),
      price_electric: Number(priceElectric),
      price_garbage: Number(priceGarbage),
      status,
    };
    
    if (editingRoom) {
      payload.id = editingRoom.id;
    }
    
    onSaveRoom(payload);
    setShowAddModal(false);
    setEditingRoom(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này? Các hóa đơn liên quan sẽ bị ẩn.')) {
      onDeleteRoom(id);
    }
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'occupied':
        return { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.12)', label: 'Đang thuê' };
      case 'repairing':
        return { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.12)', label: 'Sửa chữa' };
      default:
        return { color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.12)', label: 'Phòng trống' };
    }
  };

  return (
    <div style={styles.container} className="animate-slide-up">
      {/* Nút thêm phòng nổi bật ở trên */}
      <div style={styles.topBar}>
        <span style={styles.countText}>Tổng số: {rooms.length} phòng</span>
        <button onClick={handleOpenAdd} style={styles.addBtn} className="tap-effect">
          <Plus size={16} /> Thêm phòng
        </button>
      </div>

      {/* Danh sách phòng */}
      <div style={styles.list}>
        {rooms.map((room) => {
          const badge = getStatusBadgeStyle(room.status);
          return (
            <div key={room.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.roomNameGroup}>
                  <div style={{ ...styles.statusDot, backgroundColor: badge.color }} />
                  <span style={styles.roomName}>{room.name}</span>
                </div>
                <div style={{ ...styles.badge, color: badge.color, backgroundColor: badge.bgColor }}>
                  {badge.label}
                </div>
              </div>

              <div style={styles.cardContent}>
                <div style={styles.priceRow}>
                  <span style={styles.label}>Tiền phòng:</span>
                  <span style={styles.value}>{formatVND(room.price_room)}</span>
                </div>
                <div style={styles.ratesGrid}>
                  <div style={styles.rateItem}>
                    <span style={styles.subLabel}>Điện:</span>
                    <span style={styles.subVal}>{formatVND(room.price_electric)}/kWh</span>
                  </div>
                  <div style={styles.rateItem}>
                    <span style={styles.subLabel}>Nước:</span>
                    <span style={styles.subVal}>{formatVND(room.price_water)}/m³</span>
                  </div>
                  <div style={styles.rateItem}>
                    <span style={styles.subLabel}>Rác:</span>
                    <span style={styles.subVal}>{formatVND(room.price_garbage)}/tháng</span>
                  </div>
                </div>
              </div>

              <div style={styles.cardActions}>
                <button onClick={() => handleOpenEdit(room)} style={styles.actionEdit} className="tap-effect">
                  <Edit2 size={14} /> Sửa giá
                </button>
                <button onClick={() => handleDelete(room.id)} style={styles.actionDelete} className="tap-effect">
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Thêm / Sửa Phòng */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal} className="animate-slide-up">
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{editingRoom ? 'Cập Nhật Phòng' : 'Thêm Phòng Mới'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingRoom(null); }} style={styles.closeBtn} className="tap-effect">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Tên phòng</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Giá thuê phòng (VNĐ/Tháng)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={priceRoom}
                  onChange={(e) => setPriceRoom(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Đơn giá điện</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={priceElectric}
                    onChange={(e) => setPriceElectric(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Đơn giá nước</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={priceWater}
                    onChange={(e) => setPriceWater(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Tiền rác & Dịch vụ</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={priceGarbage}
                  onChange={(e) => setPriceGarbage(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Trạng thái phòng</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={styles.select}
                >
                  <option value="vacant">Trống</option>
                  <option value="occupied">Đang thuê</option>
                  <option value="repairing">Sửa chữa</option>
                </select>
              </div>

              <button type="submit" style={styles.submitBtn} className="tap-effect">
                {editingRoom ? 'Lưu cập nhật' : 'Khởi tạo phòng'}
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
    alignItems: 'center',
  },
  roomNameGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  roomName: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
    fontFamily: 'var(--font-heading)',
  },
  badge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    padding: '8px 0',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  value: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  ratesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
    marginTop: '4px',
  },
  rateItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  subLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  subVal: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  actionEdit: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  actionDelete: {
    background: 'none',
    border: 'none',
    color: '#f43f5e',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
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
    gap: '14px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '12px',
  },
  formLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  input: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '10px 12px',
    color: 'var(--text-main)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '10px 12px',
    color: 'var(--text-main)',
    fontSize: '14px',
    outline: 'none',
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
    marginTop: '10px',
    boxShadow: '0 4px 12px var(--primary-glow)',
  }
};
