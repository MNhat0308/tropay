# 📱 TroPay Mobile - Mobile-First PWA Bill Manager

**TroPay Mobile** là một ứng dụng di động dạng Progressive Web App (PWA) cao cấp, được xây dựng theo triết lý **Mobile-First** bằng **React 19 + Vite** và **Vanilla CSS**. Ứng dụng giúp chủ nhà trọ quản lý danh sách phòng trọ, thông tin khách thuê, tự động tính tiền điện nước theo thời gian thực (Offline-First) và hỗ trợ kết xuất hóa đơn gửi nhanh qua Zalo hoặc in PDF hàng loạt.

---

## ✨ Các Tính Năng Nổi Bật

- 📱 **Giao diện di động cao cấp**: Trải nghiệm mượt mà, hỗ trợ tự động thích ứng chế độ Sáng/Tối (Light & Dark Mode) tinh tế, tích hợp khung giả lập iPhone 15 Pro Max sang trọng trên máy tính.
- ⚡ **Offline-First & Auto-Sync**: Đo số điện nước và lưu hóa đơn ngoại tuyến không cần mạng, đồng bộ trực tiếp lên máy chủ Laravel Backend khi kết nối trực tuyến được thiết lập.
- 🤖 **AI OCR Camera**: Sử dụng máy ảnh điện thoại chụp ảnh đồng hồ điện nước, trích xuất chỉ số công tơ bằng trí tuệ nhân tạo và điền nhanh chỉ với một chạm.
- 📊 **SVG Animated Chart**: Biểu đồ hoạt họa thông minh trực quan hiển thị xu hướng tiêu thụ điện nước của 3 tháng gần nhất để phát hiện rò rỉ.
- 📂 **Xuất hóa đơn hàng loạt (Bulk PDF Export)**:
  - Gom toàn bộ hóa đơn đã chọn và kết xuất thành **1 tệp PDF duy nhất** chuyên nghiệp khi ở chế độ ngoại tuyến.
  - Tải tuần tự từng tệp PDF trực tuyến từ API Sanctum bảo mật khi có mạng.
- 🔍 **Tìm kiếm đa tầng & Lọc nhanh**: Tích hợp thanh tìm kiếm thông minh và bộ lọc ngang trạng thái trên tất cả các tab chính (Phòng trọ, Khách thuê, Hóa đơn).

---

## 🛠️ Hướng dẫn Khởi chạy Dự án (Quick Start)

### 1. Cài đặt các thư viện phụ thuộc
Đảm bảo bạn đã cài đặt NodeJS, di chuyển vào thư mục dự án và chạy:
```bash
npm install
```

### 2. Khởi chạy máy chủ phát triển (Development)
Chạy ứng dụng trong môi trường phát triển:
```bash
npm run dev
```
Trình duyệt sẽ tự động mở hoặc bạn truy cập liên kết: `http://localhost:5173`. 
Để chạy thử trên điện thoại thật, hãy đảm bảo điện thoại và máy tính kết nối chung mạng Wifi, sau đó mở trình duyệt điện thoại truy cập địa chỉ IP cục bộ (ví dụ: `http://192.168.x.x:5173`) hiển thị trong Terminal.

### 3. Đóng gói ứng dụng (Production Build)
Biên dịch ứng dụng thành mã nguồn tối ưu hóa PWA:
```bash
npm run build
```
Mã nguồn đóng gói cùng các tệp cấu hình Service Worker ngoại tuyến sẽ nằm trong thư mục `/dist`. Bạn có thể deploy thư mục này lên các dịch vụ hosting miễn phí như Vercel hoặc Netlify qua giao thức HTTPS bảo mật để cài đặt PWA lên màn hình chính điện thoại.

---

## 📖 Tài liệu Kỹ thuật dành cho Lập trình viên & AI

Nếu bạn muốn đóng góp phát triển dự án hoặc sử dụng các công cụ AI hỗ trợ lập trình ở các phiên làm việc tiếp theo, vui lòng xem tài liệu kỹ thuật chi tiết cùng chỉ dẫn prompt tại:
👉 **[Tài liệu hướng dẫn Lập trình & Chỉ dẫn AI (PROJECT_OVERVIEW.md)](./PROJECT_OVERVIEW.md)**
