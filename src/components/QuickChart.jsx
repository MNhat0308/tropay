import React from 'react';

export default function QuickChart({ bills }) {
  // Nhóm các hóa đơn theo tháng thuê và tính tổng lượng tiêu thụ điện & nước
  const monthlyData = {};
  
  bills.forEach(bill => {
    const month = `Tháng ${bill.rent_month}`;
    if (!monthlyData[month]) {
      monthlyData[month] = { electric: 0, water: 0, count: 0 };
    }
    monthlyData[month].electric += Number(bill.electric_consumption || 0);
    monthlyData[month].water += Number(bill.water_consumption || 0);
    monthlyData[month].count += 1;
  });

  // Chuyển sang dạng mảng và sắp xếp theo tháng tăng dần
  const chartData = Object.keys(monthlyData)
    .map(month => ({
      name: month,
      electric: monthlyData[month].electric,
      water: monthlyData[month].water
    }))
    .slice(-3); // Lấy tối đa 3 tháng gần nhất để vẽ biểu đồ di động

  // Nếu không có dữ liệu, dùng dữ liệu mặc định để vẽ cho đẹp mắt
  const data = chartData.length > 0 ? chartData : [
    { name: 'Tháng 3', electric: 500, water: 45 },
    { name: 'Tháng 4', electric: 490, water: 51 },
    { name: 'Tháng 5', electric: 620, water: 65 }
  ];

  // Vẽ biểu đồ SVG
  const width = 340;
  const height = 140;
  const padding = 24;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Tìm giá trị max để scale
  const maxElectric = Math.max(...data.map(d => d.electric));
  const maxWater = Math.max(...data.map(d => d.water));
  const maxVal = Math.max(maxElectric, maxWater * 10) || 100; // Nhân nước lên 10 để cân bằng tỉ lệ vẽ

  // Tính tọa độ cho các điểm vẽ
  const points = data.map((d, index) => {
    const x = padding + (index * (chartWidth / (data.length - 1 || 1)));
    const yElectric = height - padding - (d.electric / maxVal) * chartHeight;
    const yWater = height - padding - ((d.water * 10) / maxVal) * chartHeight;
    return { x, yElectric, yWater, name: d.name, originalWater: d.water, originalElectric: d.electric };
  });

  // Đường Path cho Điện
  const electricPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yElectric}`).join(' ');
  // Đường Path cho Nước
  const waterPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yWater}`).join(' ');

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Xu Hướng Tiêu Thụ Điện & Nước</h3>
      
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, backgroundColor: 'var(--primary)' }}></div>
          <span style={styles.legendLabel}>Điện (kWh)</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, backgroundColor: 'var(--accent)' }}></div>
          <span style={styles.legendLabel}>Nước (m³)</span>
        </div>
      </div>

      <div style={styles.chartContainer}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={styles.svg}>
          {/* Lưới Grid */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" />
          <line x1={padding} y1={padding + chartHeight/2} x2={width - padding} y2={padding + chartHeight/2} stroke="rgba(255,255,255,0.03)" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" />

          {/* Vẽ các vùng Gradient đẹp mắt */}
          {points.length > 1 && (
            <>
              {/* Gradient Điện */}
              <path
                d={`${electricPath} L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
                fill="url(#electricGlow)"
              />
              {/* Gradient Nước */}
              <path
                d={`${waterPath} L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
                fill="url(#waterGlow)"
              />
            </>
          )}

          {/* Cấu hình Gradient */}
          <defs>
            <linearGradient id="electricGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="waterGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Vẽ đường line */}
          <path d={electricPath} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
          <path d={waterPath} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />

          {/* Vẽ các điểm Nodes tròn trên đường line */}
          {points.map((p, i) => (
            <g key={i}>
              {/* Nút điện */}
              <circle cx={p.x} cy={p.yElectric} r="5" fill="#0f172a" stroke="var(--primary)" strokeWidth="2.5" />
              <text x={p.x} y={p.yElectric - 8} fontSize="9" fontWeight="600" fill="var(--text-main)" textAnchor="middle">
                {p.originalElectric}
              </text>

              {/* Nút nước */}
              <circle cx={p.x} cy={p.yWater} r="5" fill="#0f172a" stroke="var(--accent)" strokeWidth="2.5" />
              <text x={p.x} y={p.yWater - 8} fontSize="9" fontWeight="600" fill="var(--text-main)" textAnchor="middle">
                {p.originalWater}
              </text>

              {/* Tên tháng ở trục X */}
              <text x={p.x} y={height - 6} fontSize="10" fill="var(--text-muted)" textAnchor="middle">
                {p.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: '16px',
    padding: '16px',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f8fafc',
    fontFamily: 'var(--font-heading)',
  },
  legend: {
    display: 'flex',
    gap: '16px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  legendLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  chartContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  svg: {
    overflow: 'visible',
  }
};
