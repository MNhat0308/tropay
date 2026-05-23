import React from 'react';
import { DollarSign, Home, Users, PlusCircle, ArrowRight } from 'lucide-react';
import QuickChart from '../components/QuickChart';

export default function Dashboard({ rooms, tenants, bills, setActiveTab }) {
  // 1. Tính toán số liệu thống kê
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const vacantRooms = rooms.filter(r => r.status === 'vacant').length;
  
  // Tính tổng tiền thu được trong tháng hiện tại (ví dụ: tháng 4/2026)
  const currentMonthBills = bills.filter(b => b.rent_month === 4);
  const totalRevenue = currentMonthBills.reduce((sum, b) => sum + Number(b.total_price), 0);

  // Lấy 3 hóa đơn mới tính tiền gần nhất
  const recentBills = [...bills]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 3);

  // Hàm format tiền tệ VNĐ
  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div style={styles.container} className="animate-slide-up">
      {/* Lời chào chào chủ nhà trọ */}
      <div style={styles.welcomeSection}>
        <div>
          <h2 style={styles.welcomeText}>Xin chào, Chủ trọ! 👋</h2>
          <p style={styles.subWelcome}>Nhà trọ 44/24/8 Tăng Nhơn Phú</p>
        </div>
        <button
          onClick={() => setActiveTab('bills')}
          style={styles.quickAddBtn}
          className="tap-effect"
        >
          <PlusCircle size={18} color="#0f172a" />
          <span style={styles.quickAddText}>Tính tiền</span>
        </button>
      </div>

      {/* Grid thẻ KPI thống kê */}
      <div style={styles.kpiGrid}>
        <div style={{ ...styles.kpiCard, borderLeft: '4px solid var(--primary)' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Doanh Thu Tháng 4</span>
            <div style={{ ...styles.kpiIconBg, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <DollarSign size={16} color="var(--primary)" />
            </div>
          </div>
          <span style={styles.kpiValue}>{formatVND(totalRevenue)}</span>
          <span style={styles.kpiSub}>Thu từ {currentMonthBills.length} phòng</span>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid var(--accent)' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Phòng & Khách</span>
            <div style={{ ...styles.kpiIconBg, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
              <Home size={16} color="var(--accent)" />
            </div>
          </div>
          <span style={styles.kpiValue}>{occupiedRooms}/{totalRooms}</span>
          <span style={styles.kpiSub}>{vacantRooms} phòng trống thuê</span>
        </div>
      </div>

      {/* Biểu đồ tiêu thụ điện nước */}
      <div style={styles.sectionContainer}>
        <QuickChart bills={bills} />
      </div>

      {/* Danh sách hóa đơn tính gần nhất */}
      <div style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Hóa Đơn Mới Lập</h3>
          <button onClick={() => setActiveTab('bills')} style={styles.seeAllBtn} className="tap-effect">
            Xem tất cả <ArrowRight size={14} />
          </button>
        </div>

        <div style={styles.billList}>
          {recentBills.map((bill) => {
            const roomName = rooms.find(r => r.id === bill.room_id)?.name || 'Phòng ẩn';
            return (
              <div key={bill.id} style={styles.billItem}>
                <div style={styles.billInfo}>
                  <div style={styles.billRoom}>{roomName}</div>
                  <div style={styles.billDate}>
                    Tháng {bill.rent_month} • {new Date(bill.at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div style={styles.billPrice}>
                  <span style={styles.priceText}>{formatVND(bill.total_price)}</span>
                  <span style={styles.billStatusBadge}>Đã lưu</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
  },
  welcomeSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  welcomeText: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#f8fafc',
    fontFamily: 'var(--font-heading)',
  },
  subWelcome: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  quickAddBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--primary)',
    border: 'none',
    borderRadius: '12px',
    padding: '8px 14px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px var(--primary-glow)',
  },
  quickAddText: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    width: '100%',
  },
  kpiCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--border-light)',
    backdropFilter: 'blur(12px)',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  kpiTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  kpiIconBg: {
    width: '26px',
    height: '26px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: '-0.5px',
    margin: '4px 0',
  },
  kpiSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  sectionContainer: {
    width: '100%',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#f8fafc',
    fontFamily: 'var(--font-heading)',
  },
  seeAllBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  billList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  billItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: '14px',
    backdropFilter: 'blur(10px)',
  },
  billInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  billRoom: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f8fafc',
  },
  billDate: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  billPrice: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  priceText: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  billStatusBadge: {
    fontSize: '9px',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: '2px 6px',
    borderRadius: '6px',
    fontWeight: '600',
  }
};
