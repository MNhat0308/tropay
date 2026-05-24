# 📖 TroPay Mobile - Tài liệu hướng dẫn Lập trình & Chỉ dẫn AI

Tệp tài liệu này cung cấp cái nhìn tổng quan toàn diện về kiến trúc dự án, hệ thống thiết kế và các hướng dẫn cốt lõi giúp các mô hình AI/lập trình viên tiếp quản mã nguồn có thể tiếp tục phát triển ứng dụng một cách nhất quán và chính xác ở các phiên làm việc (prompts) tiếp theo.

---

## 🎨 Hệ thống Thiết kế & Giao diện Cao cấp (Premium Design System)

Ứng dụng sử dụng một hệ thống thiết kế mượt mà (Glassmorphism & Micro-animations) tương thích toàn diện với cả 2 chế độ sáng tối:
*   **Chế độ Mặc định (Sleek Dark Mode)**: Sử dụng màu nền tối sâu thẳm Slate (`#0F172A`), màu nhấn xanh lục bảo hoàng gia (`#10B981` đại diện cho thanh toán) kết hợp với màu xanh neon công nghệ (`#6366F1`) và các thẻ card kính mờ trong suốt (`backdrop-filter: blur(8px)`).
*   **Chế độ Sáng (Premium Light Mode)**: Tự động kích hoạt thông qua lớp `:root.light-theme` trong CSS. Sử dụng nền ngoài xám xanh nhạt (`#F1F5F9`), nền trong điện thoại trắng tinh khiết (`#FFFFFF`), các card kính trắng sữa với viền siêu mỏng và độ tương phản cao của văn bản Slate (`#0F172A`) chống chói khi đi đo số điện nước ngoài trời.
*   **Chuyển đổi giao diện (Theme Switcher)**: Toàn bộ thành phần (nền, chữ, viền, bóng đổ, thanh status bar giả lập, nút bấm) đều được chuyển đổi mượt mà bằng CSS Transition trong vòng `0.3s`. Trạng thái theme được lưu trữ lâu dài tại `localStorage` dưới khóa `tropay_theme`.

---

## 🏗️ Kiến trúc & Lựa chọn Kỹ thuật (Architectural Highlights)

### 1. Offline-First Database & Sync Layer
*   **Local Database**: Quản lý ghi nhận ngoại tuyến thông qua `db/database.js` lưu trữ trong `localStorage`. Cấu trúc bảng và định dạng dữ liệu (Model Room, Tenant, Bill) trùng khớp hoàn toàn 100% với schema của Laravel Backend.
*   **Lớp API (apiService.js)**: Sử dụng Axios/Fetch tự tạo để giao tiếp Sanctum Token. Khi kích hoạt đồng bộ (Online-Sync):
    *   Tự động tải dữ liệu thực từ server API (`fetchLiveData`).
    *   Nếu mất kết nối đột ngột hoặc Token hết hạn, hệ thống tự động gọi hàm `logout()` đưa app về chế độ Ngoại tuyến (Offline mode) an toàn, hiển thị trạng thái thực, không sử dụng Mock Login giả lập.

### 2. Hệ thống cảnh báo toàn cục không cản trở (Global Alert & Toast Injection)
Để loại bỏ hoàn toàn các hộp thoại chặn luồng `alert(...)` mặc định xấu xí của trình duyệt, `App.jsx` khai báo và gắn trực tiếp hai hàm toàn cục vào đối tượng `window`:
*   `window.showAlert(message, title, type)`: Hiển thị hộp thoại kính mờ iOS tuyệt đẹp (Thành công, Lỗi, Cảnh báo), hỗ trợ xuống dòng tự nhiên `\n`.
*   `window.showToast(message, type)`: Hiển thị thông báo dạng pop-up thả từ trên đỉnh màn hình và tự động biến mất sau 3 giây.
*   *Quy tắc*: Tuyệt đối không prop-drill các component thông báo, gọi trực tiếp thông qua đối tượng `window` ở bất kỳ view nào.

### 3. Sắp xếp tự nhiên (Natural Numeric Sorting)
Mọi danh sách phòng trọ, dropdown chọn phòng tính tiền hay dropdown bộ lọc hóa đơn đều được sắp xếp thứ tự tự nhiên (Natural Sorting) bằng thuật toán:
```javascript
list.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}))
```
Giúp `Phòng 101` luôn đứng trước `Phòng 102`, `Phòng 202` thay vì sắp lộn xộn theo thời gian tạo hoặc theo thứ tự bảng chữ cái thô.

---

## ⚡ Các Tab Tính năng Chính (Feature Suite Overview)

### 1. Tab Trang chủ (Dashboard)
*   Thống kê nhanh các chỉ số KPI: Doanh thu tháng này, số phòng trống, số khách đang ở.
*   **SVG Animated QuickChart**: Biểu đồ hoạt họa bằng SVG tự vẽ (không thư viện ngoài), mô tả xu hướng tiêu thụ điện (kWh) và nước ($m^3$) của 3 tháng gần nhất để phát hiện rò rỉ.

### 2. Tab Phòng trọ (Rooms)
*   Danh sách thẻ phòng trọ kèm nhãn trạng thái (Đang thuê - Xanh lục, Trống - Xám, Sửa chữa - Cam).
*   Thanh tìm kiếm nhanh theo tên phòng kèm bộ lọc ngang trạng thái.
*   Form thêm/sửa phòng kiểm soát an toàn chỉ số đầu vào (`min="0"`).

### 3. Tab Khách thuê (Tenants)
*   Thanh tìm kiếm thông minh tìm cùng lúc theo: Tên khách, số phòng, SĐT, số CMND/CCCD.
*   Tích hợp lối tắt liên hệ nhanh một chạm: Gọi điện trực tiếp (`tel:`) và nhắn tin Zalo (`https://zalo.me/`).
*   Form thêm khách thông minh, tự động ngăn chặn thao tác nếu hệ thống chưa được khởi tạo phòng trọ nào.

### 4. Tab Hóa đơn (Bills - Smart Billing Suite)
*   **Mặc định phòng trọ**: Khi mở Tab tính tiền mới, hệ thống tự chọn phòng trọ đầu tiên theo thứ tự tự nhiên và tự nạp chỉ số điện nước cũ gần nhất từ lịch sử hóa đơn trước đó của phòng đó.
*   **Cảnh báo thời gian thực**: Hiển thị cảnh báo đỏ trực quan ngay dưới ô nhập liệu nếu `Số mới < Số cũ`. Ngăn chặn hành động lưu nếu phát hiện tiêu thụ âm.
*   **Máy quét chỉ số bằng AI (OCR Camera)**: Sử dụng thư viện `Tesseract.js` chạy local tại client-side. Cho phép chụp ảnh đồng hồ điện/nước, phân tích trích xuất danh sách các số ứng cử viên để chủ nhà chọn điền nhanh bằng một chạm.
*   **Phiếu thu chi tiết & Gửi Zalo**: Kết xuất hóa đơn dạng thẻ sang trọng, nút sao chép văn bản tóm tắt hóa đơn chuẩn mực gửi Zalo cho khách.
*   **Xuất PDF Hàng loạt (Bulk PDF Export)**:
    *   *Chế độ Online*: Tải tuần tự từng Blob PDF từ API Sanctum `/api/bill-rooms/{bill}/pdf`, có độ trễ 350ms tránh trình duyệt chặn tải hàng loạt.
    *   *Chế độ Offline (Auto-fallback)*: Tự động gộp toàn bộ hóa đơn được chọn thành một tài liệu HTML in ấn chuyên nghiệp, tự động ngắt trang (`page-break-before: always`), cho phép lưu tất cả các hóa đơn vào chung **1 tệp PDF duy nhất** thông qua hộp thoại in của điện thoại.
*   **Lọc đa tầng**: Gồm thanh tìm kiếm theo tên phòng/ghi chú hoạt động song song cùng bộ lọc Dropdown Phòng và Dropdown Tháng.

### 5. Tab Thiết lập (Settings)
*   Nút bật tắt chế độ đồng bộ API và trường nhập thông tin URL, Email, Password trống bảo mật (không lưu sẵn mock credentials).
*   Nút chuyển đổi giao diện Sáng/Tối.
*   Nút "Reset dữ liệu mẫu" nạp nhanh 5 phòng trọ và 10 hóa đơn chuẩn để trải nghiệm lập tức.

---

## 📂 Sơ đồ cấu trúc thư mục (Directory Tree Map)

```text
tropay-mobile/
├── package.json
├── vite.config.js          <-- Cấu hình Vite, React và Service Worker PWA (standalone, portrait)
├── index.html
├── src/
│   ├── main.jsx
│   ├── index.css          <-- Thiết lập biến CSS Sáng/Tối toàn cục và hoạt họa mượt mà
│   ├── App.jsx            <-- Khung xương ứng dụng, định tuyến tab, tiêm thông báo toàn cục window
│   ├── components/        <-- Các component dùng chung
│   │   ├── BottomNav.jsx         <-- Thanh điều hướng dưới cùng dạng haptic-touch
│   │   ├── PhoneSimulator.jsx    <-- Khung giả lập iPhone 15 Pro Max cao cấp trên desktop
│   │   ├── ScreenWrapper.jsx     <-- Khung bao bọc màn hình đồng bộ thanh trạng thái status bar
│   │   ├── PasscodeLock.jsx      <-- Màn hình khóa PIN bảo mật 4 số (không hiện gợi ý mật mã)
│   │   └── QuickChart.jsx        <-- Biểu đồ SVG xu hướng điện nước hoạt họa
│   ├── db/
│   │   ├── database.js           <-- Quản lý dữ liệu offline qua LocalStorage
│   │   └── mockData.js           <-- Dữ liệu mẫu ban đầu để chạy thử nghiệm
│   ├── services/
│   │   └── apiService.js         <-- Dịch vụ kết nối API và fetch Blob PDF qua token Sanctum
│   └── views/             <-- Các màn hình chính
│       ├── Dashboard.jsx
│       ├── Rooms.jsx             <-- Có tìm kiếm & lọc trạng thái
│       ├── Tenants.jsx           <-- Có tìm kiếm đa năng & nút gọi/Zalo
│       ├── Bills.jsx             <-- Có tính tiền, máy ảnh OCR, xuất PDF đơn lẻ & hàng loạt
│       └── Settings.jsx          <-- Có toggle Sáng/Tối, kết nối API sạch
```

---

## 🤖 Hướng dẫn dành cho các phiên làm việc tiếp theo (Guidelines for Next Prompts)

Khi tiếp tục chỉnh sửa hoặc thêm tính năng cho TroPay Mobile, vui lòng tuân thủ nghiêm ngặt các nguyên tắc sau:

1.  **Chuyển đổi giao diện (Theme Consistency)**:
    *   Tuyệt đối KHÔNG sử dụng mã màu cố định (như `#ffffff`, `#1e293b`).
    *   Luôn luôn sử dụng các biến CSS động đã định nghĩa trong `index.css` (ví dụ: `var(--bg-app)`, `var(--bg-card)`, `var(--text-main)`, `var(--text-muted)`, `var(--border-light)`).
2.  **Thông báo & Hộp thoại (No Browser Alerts)**:
    *   Tuyệt đối KHÔNG sử dụng hàm `alert(...)` mặc định của trình duyệt.
    *   Hãy gọi `window.showAlert(nội dung, tiêu đề, loại)` cho các cảnh báo quan trọng cần nút Đồng ý.
    *   Hãy gọi `window.showToast(nội dung, loại)` cho các thông báo thao tác nhanh (như "Đã lưu", "Đã sao chép").
3.  **An toàn dữ liệu đầu vào (Form Validation)**:
    *   Luôn áp dụng giới hạn giá trị âm (`min="0"`) cho các trường số lượng và đơn giá.
    *   Tiến hành kiểm tra dữ liệu đầu vào trước khi lưu hóa đơn (so sánh chỉ số cũ/mới) để tránh lưu dữ liệu lỗi xuống Local và Server.
4.  **Cú pháp & Biên dịch (Vite Compatibility)**:
    *   Mã nguồn sử dụng React 19 mới nhất, đảm bảo viết cú pháp JSX sạch sẽ, không gây lỗi biên dịch.
    *   Trước khi kết thúc turn làm việc, luôn chạy kiểm tra build production bằng lệnh: `npm run build` để kiểm nghiệm bundle size và đảm bảo không phát sinh bất kỳ cảnh báo/lỗi biên dịch nào.
