import React, { useState, useEffect } from 'react';

export default function PhoneSimulator({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [time, setTime] = useState('');

  // Cập nhật đồng hồ của thanh trạng thái điện thoại
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      let hours = date.getHours();
      let minutes = date.getMinutes();
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Phát hiện kích thước màn hình để bật/tắt khung giả lập
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#090d16', position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Nền hoạt họa mờ ảo phía sau khung điện thoại để tăng vẻ thẩm mỹ */}
      <div style={styles.glowBg1}></div>
      <div style={styles.glowBg2}></div>
      
      {/* Khung iPhone 15 Pro Max */}
      <div style={styles.phoneFrame}>
        {/* Nút bên hông (Volume/Power) */}
        <div style={styles.volumeUp}></div>
        <div style={styles.volumeDown}></div>
        <div style={styles.powerButton}></div>
        
        {/* Màn hình điện thoại */}
        <div style={styles.screen}>
          {/* Dynamic Island (Đảo thích ứng) */}
          <div style={styles.dynamicIsland}>
            <div style={styles.cameraLens}></div>
          </div>
          
          {/* Thanh trạng thái (Status Bar) */}
          <div style={styles.statusBar}>
            <span style={styles.statusTime}>{time}</span>
            <div style={styles.statusIcons}>
              {/* Cột sóng */}
              <svg width="17" height="11" viewBox="0 0 17 11" fill="none" style={styles.statusIcon}>
                <rect x="0" y="8" width="2.5" height="3" rx="0.5" fill="#f8fafc" />
                <rect x="3.5" y="6" width="2.5" height="5" rx="0.5" fill="#f8fafc" />
                <rect x="7" y="4" width="2.5" height="7" rx="0.5" fill="#f8fafc" />
                <rect x="10.5" y="2" width="2.5" height="9" rx="0.5" fill="#f8fafc" />
                <rect x="14" y="0" width="2.5" height="11" rx="0.5" fill="#f8fafc" />
              </svg>
              {/* Wifi */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" style={styles.statusIcon}>
                <path d="M8 12C8.55228 12 9 11.5523 9 11C9 10.4477 8.55228 10 8 10C7.44772 10 7 10.4477 7 11C7 11.5523 7.44772 12 8 12Z" fill="#f8fafc"/>
                <path d="M5.17157 8.17157C6.73367 6.60948 9.26633 6.60948 10.8284 8.17157C11.1097 8.4528 11.5654 8.4528 11.8466 8.17157C12.1278 7.89035 12.1278 7.43463 11.8466 7.1534C9.70295 5.00976 6.29705 5.00976 4.1534 7.1534C3.87217 7.43463 3.87217 7.89035 4.1534 8.17157C4.43463 8.4528 4.89035 8.4528 5.17157 8.17157Z" fill="#f8fafc"/>
                <path d="M2.34315 5.34315C5.46734 2.21895 10.5327 2.21895 13.6569 5.34315C13.9381 5.62437 14.3938 5.62437 14.675 5.34315C14.9563 5.06192 14.9563 4.6062 14.675 4.32497C10.9701 0.620022 5.0299 0.620022 1.32497 4.32497C1.04375 4.6062 1.04375 5.06192 1.32497 5.34315C1.6062 5.62437 2.06192 5.62437 2.34315 5.34315Z" fill="#f8fafc"/>
              </svg>
              {/* Pin */}
              <div style={styles.batteryContainer}>
                <div style={styles.batteryBody}>
                  <div style={styles.batteryLevel}></div>
                </div>
                <div style={styles.batteryTip}></div>
              </div>
            </div>
          </div>

          {/* Vùng hiển thị Nội dung Ứng dụng */}
          <div style={styles.contentArea}>
            {children}
          </div>

          {/* Thanh nút Home ảo (Home Indicator) */}
          <div style={styles.homeIndicatorContainer}>
            <div style={styles.homeIndicator}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#05070c',
    position: 'relative',
    overflow: 'hidden',
  },
  glowBg1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(0,0,0,0) 70%)',
    top: '-10%',
    left: '20%',
    zIndex: 1,
    filter: 'blur(30px)',
  },
  glowBg2: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(0,0,0,0) 70%)',
    bottom: '-10%',
    right: '20%',
    zIndex: 1,
    filter: 'blur(40px)',
  },
  phoneFrame: {
    position: 'relative',
    zIndex: 10,
    width: '415px',
    height: '860px',
    borderRadius: '56px',
    border: '12px solid #1e293b', // Viền bezel titan sang trọng
    boxShadow: `
      0 25px 50px -12px rgba(0, 0, 0, 0.7),
      inset 0 4px 6px rgba(255, 255, 255, 0.15),
      inset 0 -4px 6px rgba(0, 0, 0, 0.4),
      0 0 0 2px rgba(255, 255, 255, 0.05)
    `,
    backgroundColor: '#090d16',
    padding: '4px',
    display: 'flex',
    flexDirection: 'column',
  },
  screen: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '44px',
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
  },
  // Nút vật lý mô phỏng bên ngoài
  volumeUp: {
    position: 'absolute',
    left: '-16px',
    top: '180px',
    width: '4px',
    height: '35px',
    backgroundColor: '#1e293b',
    borderRadius: '2px 0 0 2px',
  },
  volumeDown: {
    position: 'absolute',
    left: '-16px',
    top: '230px',
    width: '4px',
    height: '35px',
    backgroundColor: '#1e293b',
    borderRadius: '2px 0 0 2px',
  },
  powerButton: {
    position: 'absolute',
    right: '-16px',
    top: '210px',
    width: '4px',
    height: '60px',
    backgroundColor: '#1e293b',
    borderRadius: '0 2px 2px 0',
  },
  // Đảo thích ứng (Dynamic Island)
  dynamicIsland: {
    position: 'absolute',
    zIndex: 999,
    top: '11px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '110px',
    height: '30px',
    backgroundColor: '#000000',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '12px',
    boxShadow: 'inset 0 0 4px rgba(255,255,255,0.1)',
  },
  cameraLens: {
    width: '12px',
    height: '12px',
    backgroundColor: '#08081a',
    borderRadius: '50%',
    border: '2px solid #111122',
    boxShadow: 'inset 0 0 2px rgba(255,255,255,0.2)',
  },
  // Thanh trạng thái (Status Bar)
  statusBar: {
    height: '42px',
    display: 'flex',
    justifyContent: 'between',
    alignItems: 'center',
    padding: '0 28px 0 28px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#f8fafc',
    letterSpacing: '-0.1px',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 990,
    pointerEvents: 'none',
  },
  statusTime: {
    flex: 1,
    textAlign: 'left',
  },
  statusIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusIcon: {
    opacity: 0.9,
  },
  batteryContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  batteryBody: {
    width: '20px',
    height: '10px',
    border: '1.5px solid #f8fafc',
    borderRadius: '3px',
    padding: '1px',
    opacity: 0.9,
  },
  batteryLevel: {
    width: '100%',
    height: '100%',
    backgroundColor: '#10b981', // 100% pin màu xanh
    borderRadius: '1px',
  },
  batteryTip: {
    width: '1.5px',
    height: '4px',
    backgroundColor: '#f8fafc',
    borderRadius: '0 1px 1px 0',
    opacity: 0.9,
  },
  // Vùng hiển thị Nội dung
  contentArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingTop: '42px', // Chừa khoảng trống cho status bar
    paddingBottom: '20px', // Chừa khoảng trống cho home indicator
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  // Home Indicator
  homeIndicatorContainer: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    height: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 990,
    pointerEvents: 'none',
  },
  homeIndicator: {
    width: '120px',
    height: '4.5px',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: '2.5px',
  }
};
