import React, { useState, useEffect } from 'react';
import { Plus, X, Calculator, Eye, FileText, CheckCircle2, ChevronRight, Copy, Share2, CornerUpLeft, Camera, Search } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function Bills({ bills, rooms, onSaveBill, onDeleteBill }) {
  const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' or 'create'
  const [selectedBill, setSelectedBill] = useState(null); // Để hiển thị hóa đơn chi tiết

  // Trạng thái cho chọn hàng loạt (Bulk selection)
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedBillIds, setSelectedBillIds] = useState([]);
  const [bulkExporting, setBulkExporting] = useState(false);
  const [bulkExportProgress, setBulkExportProgress] = useState('');

  // Các trường của bộ tính tiền
  const [roomId, setRoomId] = useState('');
  const [rentMonth, setRentMonth] = useState(new Date().getMonth() + 1); // Tháng thuê mặc định là tháng này
  const [oldElectric, setOldElectric] = useState('0');
  const [newElectric, setNewElectric] = useState('');
  const [electricConsumption, setElectricConsumption] = useState(0);
  const [oldWater, setOldWater] = useState('0');
  const [newWater, setNewWater] = useState('');
  const [waterConsumption, setWaterConsumption] = useState(0);
  
  // Đơn giá lấy từ phòng trọ
  const [priceRoom, setPriceRoom] = useState(0);
  const [priceElectric, setPriceElectric] = useState(0);
  const [priceWater, setPriceWater] = useState(0);
  const [priceGarbage, setPriceGarbage] = useState(0);
  
  const [note, setNote] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  // Các bộ lọc lịch sử hóa đơn
  const [filterRoomId, setFilterRoomId] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBills = [...bills]
    .filter(bill => {
      const rName = rooms.find(r => r.id === bill.room_id)?.name || '';
      const matchesRoom = filterRoomId === 'all' || Number(bill.room_id) === Number(filterRoomId);
      const matchesMonth = filterMonth === 'all' || Number(bill.rent_month) === Number(filterMonth);
      
      const query = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        rName.toLowerCase().includes(query) ||
        (bill.note && bill.note.toLowerCase().includes(query));
        
      return matchesRoom && matchesMonth && matchesSearch;
    })
    .sort((a, b) => new Date(b.at) - new Date(a.at));

  // Các trạng thái cho máy quét chỉ số thông minh bằng AI (OCR)
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrImage, setOcrImage] = useState('');
  const [ocrCandidates, setOcrCandidates] = useState([]);
  const [ocrTargetField, setOcrTargetField] = useState(''); // 'electric' hoặc 'water'

  // Khi thay đổi Phòng, tự động tải các đơn giá gốc và tìm Số Điện/Nước Cũ gần nhất từ hóa đơn trước đó
  useEffect(() => {
    if (!roomId) return;
    const selectedRoom = rooms.find(r => r.id === Number(roomId));
    if (!selectedRoom) return;

    // Thiết lập đơn giá gốc của phòng (ép kiểu Number phòng hờ API trả về dạng String)
    setPriceRoom(Number(selectedRoom.price_room || 0));
    setPriceElectric(Number(selectedRoom.price_electric || 0));
    setPriceWater(Number(selectedRoom.price_water || 0));
    setPriceGarbage(Number(selectedRoom.price_garbage || 0));

    // Tìm hóa đơn gần nhất của phòng này
    const roomBills = bills
      .filter(b => b.room_id === Number(roomId))
      .sort((a, b) => new Date(b.at) - new Date(a.at));

    if (roomBills.length > 0) {
      const lastBill = roomBills[0];
      setOldElectric(Number(lastBill.new_electric || 0).toString());
      setOldWater(Number(lastBill.new_water || 0).toString());
    } else {
      setOldElectric('0');
      setOldWater('0');
    }
    
    setNewElectric('');
    setNewWater('');
    setElectricConsumption(0);
    setWaterConsumption(0);
    setTotalPrice(Number(selectedRoom.price_room || 0) + Number(selectedRoom.price_garbage || 0));
  }, [roomId, rooms, bills]);

  // Mặc định chọn phòng đầu tiên sau khi đã sắp xếp tự nhiên lúc load rooms
  useEffect(() => {
    if (rooms.length > 0 && !roomId) {
      const sorted = [...rooms].sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
      setRoomId(sorted[0].id.toString());
    }
  }, [rooms, roomId]);

  // Tự động tính lượng tiêu thụ và tổng tiền khi nhập chỉ số mới
  useEffect(() => {
    const elecCons = Math.max(0, Number(newElectric || 0) - Number(oldElectric || 0));
    const waterCons = Math.max(0, Number(newWater || 0) - Number(oldWater || 0));
    
    setElectricConsumption(elecCons);
    setWaterConsumption(waterCons);
    
    // Tính toán tiền điện phẳng (Không lũy tiến)
    const elecBill = elecCons * Number(priceElectric);
    
    const calculatedTotal = elecBill + (waterCons * Number(priceWater)) + Number(priceRoom) + Number(priceGarbage);
    setTotalPrice(calculatedTotal);
  }, [newElectric, oldElectric, newWater, oldWater, priceElectric, priceWater, priceRoom, priceGarbage]);

  const handleOpenCreate = () => {
    if (rooms.length > 0) {
      const sorted = [...rooms].sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
      setRoomId(sorted[0].id.toString());
    }
    setRentMonth(new Date().getMonth() + 1);
    setNote('');
    setActiveSubTab('create');
    setSelectedBill(null);
  };

  const handleCalculateSave = (e) => {
    e.preventDefault();
    if (!roomId || rooms.length === 0) {
      window.showAlert('Vui lòng tạo ít nhất một phòng trọ trong tab "Phòng trọ" trước khi tính tiền!', 'THIẾU PHÒNG TRỌ', 'warning');
      return;
    }
    if (Number(newElectric) < Number(oldElectric)) {
      window.showAlert('Số điện mới không được nhỏ hơn số điện cũ!', 'CHỈ SỐ HỢP LỆ', 'error');
      return;
    }
    if (Number(newWater) < Number(oldWater)) {
      window.showAlert('Số nước mới không được nhỏ hơn số nước cũ!', 'CHỈ SỐ HỢP LỆ', 'error');
      return;
    }

    const payload = {
      room_id: Number(roomId),
      rent_month: Number(rentMonth),
      old_electric: Number(oldElectric),
      new_electric: Number(newElectric),
      electric_consumption: electricConsumption,
      old_water: Number(oldWater),
      new_water: Number(newWater),
      water_consumption: waterConsumption,
      price_room: priceRoom,
      price_water: priceWater,
      price_electric: priceElectric,
      price_garbage: priceGarbage,
      total_price: totalPrice,
      note: note || `Tiền phòng tháng ${rentMonth} phòng ${rooms.find(r => r.id === Number(roomId))?.name}`,
    };

    onSaveBill(payload);
    setActiveSubTab('list');
    
    // Tự động mở hóa đơn vừa tạo để xem chi tiết
    // (Tìm id lớn nhất hoặc hóa đơn mới nhất vừa lưu)
    setTimeout(() => {
      window.showToast('Lưu hóa đơn và tính tiền thành công!', 'success');
    }, 100);
  };

  const handleStartScan = (target) => {
    setOcrTargetField(target);
    setOcrCandidates([]);
    setOcrImage('');
    setOcrProgress(0);
    
    // Tạo phần tử input ẩn để kích hoạt camera điện thoại trực tiếp
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.capture = 'environment'; // Ưu tiên camera sau của điện thoại
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setOcrModalOpen(true);
      setOcrLoading(true);

      // Đọc ảnh và hiển thị preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setOcrImage(event.target.result);
      };
      reader.readAsDataURL(file);

      try {
        // Tải Tesseract.js động và chạy nhận diện chữ số
        const Tesseract = await import('tesseract.js');
        
        const result = await Tesseract.default.recognize(
          file,
          'eng',
          {
            logger: m => {
              if (m.status === 'recognizing text') {
                setOcrProgress(Math.round(m.progress * 100));
              }
            }
          }
        );

        const recognizedText = result.data.text || '';
        console.log("OCR Raw Text:", recognizedText);

        // Tìm tất cả các dãy số (độ dài >= 2 chữ số) trong chuỗi kết quả
        const matches = recognizedText.match(/\d+/g) || [];
        const uniqueCandidates = [...new Set(matches.map(s => s.trim()))].filter(s => s.length >= 2);
        
        setOcrCandidates(uniqueCandidates);
        
        // Nếu chỉ tìm thấy đúng 1 số thích hợp, tự động điền luôn
        if (uniqueCandidates.length === 1) {
          fillOcrValue(uniqueCandidates[0]);
        }
      } catch (err) {
        console.error("Lỗi quét chỉ số điện nước:", err);
        window.showAlert("Không thể nhận diện ảnh chụp. Vui lòng thử chụp lại rõ nét hơn hoặc nhập tay.", "LỖI QUÉT ẢNH", "error");
      } finally {
        setOcrLoading(false);
      }
    };

    fileInput.click();
  };

  const fillOcrValue = (val) => {
    if (ocrTargetField === 'electric') {
      setNewElectric(val);
    } else if (ocrTargetField === 'water') {
      setNewWater(val);
    }
    setOcrModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa hóa đơn này?')) {
      onDeleteBill(id);
      setSelectedBill(null);
    }
  };

  // Sao chép hóa đơn gửi Zalo dạng văn bản tóm tắt cực kỳ chuyên nghiệp
  const copyShareText = (bill) => {
    const rName = rooms.find(r => r.id === bill.room_id)?.name || '';
    
    // Tính toán tiền điện phẳng gửi Zalo
    const cons = Number(bill.electric_consumption);
    const basePrice = Number(bill.price_electric);
    const elecCost = cons * basePrice;
    const elecDetail = `${cons} kWh x ${formatVND(basePrice)} = ${formatVND(elecCost)}`;

    const shareText = `🧾 PHIẾU THU TIỀN PHÒNG THÁNG ${bill.rent_month}
------------------------------
🏠 Phòng: ${rName}
💰 Tổng cộng: ${formatVND(bill.total_price)}

Chi tiết dịch vụ:
- Tiền phòng: ${formatVND(bill.price_room)}
- Điện: (${bill.old_electric} -> ${bill.new_electric}) = ${elecDetail}
- Nước: (${bill.old_water} -> ${bill.new_water}) = ${bill.water_consumption} m³ x ${formatVND(bill.price_water)} = ${formatVND(bill.water_consumption * bill.price_water)}
- Rác & Dịch vụ: ${formatVND(bill.price_garbage)}
------------------------------
📞 Liên hệ chủ nhà: Đoàn Văn Cường (0985626739)
Cảm ơn bạn đã thanh toán đúng hạn! 🙏`;

    window.showToast('Đã sao chép nội dung tóm tắt hóa đơn! Bạn có thể dán (Paste) để gửi ngay qua Zalo hoặc SMS cho khách thuê.', 'success');
  };

  // Trình in Offline: Kết xuất phiếu in HTML và mở trình in PDF của trình duyệt
  const openOfflinePrint = (bill, rName) => {
    const printWindow = window.open('', '_blank', 'width=800,height=700');
    if (!printWindow) {
      window.showAlert('Trình duyệt đã chặn cửa sổ bật lên. Vui lòng cấp quyền Pop-up để xuất PDF!', 'CHẶN POPUP', 'warning');
      return;
    }

    // Tính toán lượng tiêu thụ điện phẳng cho bản in PDF offline
    const cons = Number(bill.electric_consumption);
    const basePrice = Number(bill.price_electric);
    const elecCost = cons * basePrice;
    let elecDetailHtml = `Chỉ số: ${bill.old_electric} → ${bill.new_electric} = ${cons} kWh`;
    let elecUnitPriceText = formatVND(basePrice);
    
    const invoiceHTML = `
      <!doctype html>
      <html>
        <head>
          <title>Phiếu thu tiền trọ - ${rName}</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; background-color: #ffffff; }
            .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 12px; margin-bottom: 20px; }
            h2 { margin: 0; font-size: 22px; color: #0f172a; }
            .sub-title { font-size: 14px; color: #64748b; margin-top: 4px; display: block; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            th { text-align: left; border-bottom: 2px solid #0f172a; padding: 10px 8px; font-weight: bold; font-size: 13px; text-transform: uppercase; color: #0f172a; }
            td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .detail-meter { font-size: 11px; color: #64748b; font-weight: normal; display: block; margin-top: 2px; }
            .total-box { display: flex; justify-content: space-between; border-top: 2.5px dashed #cbd5e1; padding-top: 15px; font-weight: bold; font-size: 18px; margin-top: 10px; }
            .footer { text-align: center; font-size: 13px; color: #475569; margin-top: 50px; border-top: 1px solid #f1f5f9; padding-top: 20px; line-height: 1.5; }
            @media print {
              body { padding: 0; }
              @page { size: auto; margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>PHIẾU THU TIỀN TRỌ</h2>
            <span class="sub-title">Tháng ${bill.rent_month} năm 2026</span>
          </div>
          <div class="meta">
            <div><strong>Phòng:</strong> ${rName}</div>
            <div><strong>Ngày lập phiếu:</strong> ${new Date(bill.at).toLocaleDateString('vi-VN')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Khoản thu</th>
                <th class="right">Đơn giá</th>
                <th class="right">Lượng</th>
                <th class="right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="bold">Tiền phòng</td>
                <td class="right">${formatVND(bill.price_room)}</td>
                <td class="right">1</td>
                <td class="right bold">${formatVND(bill.price_room)}</td>
              </tr>
              <tr>
                <td class="bold">
                  Tiền điện
                  <span class="detail-meter">${elecDetailHtml}</span>
                </td>
                <td class="right">${elecUnitPriceText}</td>
                <td class="right">${bill.electric_consumption}</td>
                <td class="right bold">${formatVND(elecCost)}</td>
              </tr>
              <tr>
                <td class="bold">
                  Tiền nước
                  <span class="detail-meter">Chỉ số: ${bill.old_water} → ${bill.new_water}</span>
                </td>
                <td class="right">${formatVND(bill.price_water)}</td>
                <td class="right">${bill.water_consumption}</td>
                <td class="right bold">${formatVND(bill.water_consumption * bill.price_water)}</td>
              </tr>
              <tr>
                <td class="bold">Tiền rác & Dịch vụ</td>
                <td class="right">${formatVND(bill.price_garbage)}</td>
                <td class="right">1</td>
                <td class="right bold">${formatVND(bill.price_garbage)}</td>
              </tr>
            </tbody>
          </table>
          <div class="total-box">
            <span>TỔNG CỘNG TIỀN TRỌ:</span>
            <span style="color: #10b981;">${formatVND(bill.total_price)}</span>
          </div>
          <div class="footer">
            <div><strong>Người thu tiền:</strong> ĐOÀN VĂN CƯỜNG</div>
            <div>Số điện thoại liên hệ: <strong>0985626739</strong></div>
            <div style="font-size: 11px; margin-top: 12px; font-style: italic;">
              Địa chỉ: 44/24/8 Tăng Nhơn Phú, P. Phước Long B, Tp Thủ Đức, TP HCM
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  // Xuất hóa đơn ra PDF (Liên kết API trực tiếp nếu Online, In trực quan nếu Offline)
  const handleExportPDF = async (bill) => {
    const rName = rooms.find(r => r.id === bill.room_id)?.name || '';
    const syncConfig = JSON.parse(localStorage.getItem('tropay_sync_config') || '{}');
    
    if (syncConfig && syncConfig.enabled && syncConfig.apiUrl && syncConfig.token) {
      try {
        // 1. Chế độ ONLINE: Gọi tải từ API bằng Token Sanctum dưới dạng Blob
        const blob = await apiService.fetchBillPdfBlob(bill.id);
        const fileUrl = window.URL.createObjectURL(blob);
        
        // Tạo liên kết ẩn để kích hoạt tải tệp
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = `${rName}-HoaDon-Thang${bill.rent_month}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(fileUrl);
      } catch (err) {
        console.error("Lỗi tải PDF từ server:", err);
        window.showAlert(`Không thể tải PDF trực tiếp từ máy chủ: ${err.message || 'Lỗi kết nối.'}\nỨng dụng sẽ tự động chuyển sang chế độ in offline.`, 'TẢI PDF THẤT BẠI', 'warning');
        // Tự động chuyển hướng sang chế độ in Offline nếu API xảy ra lỗi hoặc token không hợp lệ
        openOfflinePrint(bill, rName);
      }
    } else {
      // 2. Chế độ OFFLINE: Kết xuất phiếu in HTML và mở trình in PDF của trình duyệt
      openOfflinePrint(bill, rName);
    }
  };

  // Trình in gộp hàng loạt Offline: Kết xuất tất cả hóa đơn đã chọn thành 1 file in chung để in/lưu PDF gộp
  const handleOfflineBulkPrint = (ids) => {
    const printWindow = window.open('', '_blank', 'width=800,height=700');
    if (!printWindow) {
      window.showAlert('Trình duyệt đã chặn cửa sổ bật lên. Vui lòng cấp quyền Pop-up để xuất PDF!', 'CHẶN POPUP', 'warning');
      return;
    }

    let bulkBillsHtml = '';
    
    for (let i = 0; i < ids.length; i++) {
      const bill = bills.find(b => b.id === ids[i]);
      if (!bill) continue;
      const rName = rooms.find(r => r.id === bill.room_id)?.name || '';
      
      const cons = Number(bill.electric_consumption);
      const basePrice = Number(bill.price_electric);
      const elecCost = cons * basePrice;
      let elecDetailHtml = `Chỉ số: ${bill.old_electric} → ${bill.new_electric} = ${cons} kWh`;
      let elecUnitPriceText = formatVND(basePrice);

      bulkBillsHtml += `
        <div class="bill-page ${i > 0 ? 'page-break' : ''}">
          <div class="header">
            <h2>PHIẾU THU TIỀN TRỌ</h2>
            <span class="sub-title">Tháng ${bill.rent_month} năm 2026</span>
          </div>
          <div class="meta">
            <div><strong>Phòng:</strong> ${rName}</div>
            <div><strong>Ngày lập phiếu:</strong> ${new Date(bill.at).toLocaleDateString('vi-VN')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Khoản thu</th>
                <th class="right">Đơn giá</th>
                <th class="right">Lượng</th>
                <th class="right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="bold">Tiền phòng</td>
                <td class="right">${formatVND(bill.price_room)}</td>
                <td class="right">1</td>
                <td class="right bold">${formatVND(bill.price_room)}</td>
              </tr>
              <tr>
                <td class="bold">
                  Tiền điện
                  <span class="detail-meter">${elecDetailHtml}</span>
                </td>
                <td class="right">${elecUnitPriceText}</td>
                <td class="right">${bill.electric_consumption}</td>
                <td class="right bold">${formatVND(elecCost)}</td>
              </tr>
              <tr>
                <td class="bold">
                  Tiền nước
                  <span class="detail-meter">Chỉ số: ${bill.old_water} → ${bill.new_water}</span>
                </td>
                <td class="right">${formatVND(bill.price_water)}</td>
                <td class="right">${bill.water_consumption}</td>
                <td class="right bold">${formatVND(bill.water_consumption * bill.price_water)}</td>
              </tr>
              <tr>
                <td class="bold">Tiền rác & Dịch vụ</td>
                <td class="right">${formatVND(bill.price_garbage)}</td>
                <td class="right">1</td>
                <td class="right bold">${formatVND(bill.price_garbage)}</td>
              </tr>
            </tbody>
          </table>
          <div class="total-box">
            <span>TỔNG CỘNG TIỀN TRỌ:</span>
            <span style="color: #10b981;">${formatVND(bill.total_price)}</span>
          </div>
          <div class="footer">
            <div><strong>Người thu tiền:</strong> ĐOÀN VĂN CƯỜNG</div>
            <div>Số điện thoại liên hệ: <strong>0985626739</strong></div>
            <div style="font-size: 11px; margin-top: 12px; font-style: italic;">
              Địa chỉ: 44/24/8 Tăng Nhơn Phú, P. Phước Long B, Tp Thủ Đức, TP HCM
            </div>
          </div>
        </div>
      `;
    }

    const htmlContent = `
      <!doctype html>
      <html>
        <head>
          <title>In danh sách phiếu thu tiền trọ</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: sans-serif; padding: 20px; color: #1e293b; background-color: #ffffff; }
            .bill-page { padding: 30px; border: 1px dashed #cbd5e1; border-radius: 12px; margin-bottom: 40px; box-sizing: border-box; page-break-inside: avoid; }
            .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 12px; margin-bottom: 20px; }
            h2 { margin: 0; font-size: 22px; color: #0f172a; }
            .sub-title { font-size: 14px; color: #64748b; margin-top: 4px; display: block; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            th { text-align: left; border-bottom: 2px solid #0f172a; padding: 10px 8px; font-weight: bold; font-size: 13px; text-transform: uppercase; color: #0f172a; }
            td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .detail-meter { font-size: 11px; color: #64748b; font-weight: normal; display: block; margin-top: 2px; }
            .total-box { display: flex; justify-content: space-between; border-top: 2.5px dashed #cbd5e1; padding-top: 15px; font-weight: bold; font-size: 18px; margin-top: 10px; }
            .footer { text-align: center; font-size: 13px; color: #475569; margin-top: 50px; border-top: 1px solid #f1f5f9; padding-top: 20px; line-height: 1.5; }
            
            @media print {
              body { padding: 0; background: none; }
              .bill-page { border: none; margin: 0; padding: 0; }
              .page-break { page-break-before: always; }
              @page { size: auto; margin: 20mm; }
            }
          </style>
        </head>
        <body>
          ${bulkBillsHtml}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Xuất hóa đơn hàng loạt ra PDF
  const handleBulkExportPDF = async () => {
    if (selectedBillIds.length === 0) return;
    
    const syncConfig = JSON.parse(localStorage.getItem('tropay_sync_config') || '{}');
    
    if (syncConfig && syncConfig.enabled && syncConfig.apiUrl && syncConfig.token) {
      // 1. CHẾ ĐỘ ONLINE: Tải lần lượt từng PDF Blob qua API sử dụng token Sanctum
      setBulkExporting(true);
      try {
        for (let i = 0; i < selectedBillIds.length; i++) {
          const bId = selectedBillIds[i];
          const bill = bills.find(b => b.id === bId);
          if (!bill) continue;
          
          setBulkExportProgress(`Tải PDF: ${i + 1}/${selectedBillIds.length}...`);
          
          const rName = rooms.find(r => r.id === bill.room_id)?.name || '';
          const blob = await apiService.fetchBillPdfBlob(bill.id);
          const fileUrl = window.URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = fileUrl;
          link.download = `${rName}-HoaDon-Thang${bill.rent_month}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(fileUrl);
          
          // Thêm độ trễ nhỏ (350ms) để trình duyệt xử lý kịp nhiều file tải xuống
          await new Promise(resolve => setTimeout(resolve, 350));
        }
        window.showToast('Đã tải xuống thành công tất cả hóa đơn đã chọn!', 'success');
        setBulkMode(false);
        setSelectedBillIds([]);
      } catch (err) {
        console.error("Lỗi xuất PDF hàng loạt:", err);
        window.showAlert(`Lỗi khi tải PDF trực tiếp: ${err.message || 'Lỗi kết nối.'}\nỨng dụng sẽ tự động chuyển sang chế độ in Offline gộp chung tất cả hóa đơn đã chọn!`, 'XUẤT BẢN THẤT BẠI', 'warning');
        // Fallback gộp chung trong 1 cửa sổ in
        handleOfflineBulkPrint(selectedBillIds);
      } finally {
        setBulkExporting(false);
        setBulkExportProgress('');
      }
    } else {
      // 2. CHẾ ĐỘ OFFLINE: Kết xuất phiếu in gộp chung tất cả hóa đơn đã chọn trong 1 trang duy nhất để người dùng in thành 1 file PDF gộp!
      handleOfflineBulkPrint(selectedBillIds);
      setBulkMode(false);
      setSelectedBillIds([]);
    }
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div style={styles.container} className="animate-slide-up">
      
      {/* Menu Subtab ở đầu trang hóa đơn */}
      {selectedBill === null && (
        <div style={styles.tabHeader}>
          <button
            onClick={() => setActiveSubTab('list')}
            style={{
              ...styles.tabLink,
              borderBottom: activeSubTab === 'list' ? '2.5px solid var(--primary)' : 'none',
              color: activeSubTab === 'list' ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            Lịch sử hóa đơn
          </button>
          <button
            onClick={handleOpenCreate}
            style={{
              ...styles.tabLink,
              borderBottom: activeSubTab === 'create' ? '2.5px solid var(--primary)' : 'none',
              color: activeSubTab === 'create' ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            <Calculator size={14} style={{ marginRight: 4 }} /> Tính tiền mới
          </button>
        </div>
      )}

      {/* --- MÀN HÌNH 1: CHI TIẾT HÓA ĐƠN --- */}
      {selectedBill !== null && (
        <div style={styles.invoiceView} className="animate-fade-in">
          <div style={styles.invoiceActions}>
            <button onClick={() => setSelectedBill(null)} style={styles.btnBack} className="tap-effect" title="Quay lại">
              <CornerUpLeft size={16} />
            </button>
            <button onClick={() => handleExportPDF(selectedBill)} style={styles.btnPdf} className="tap-effect">
              <FileText size={14} /> Xuất PDF
            </button>
            <button onClick={() => copyShareText(selectedBill)} style={styles.btnCopy} className="tap-effect">
              <Copy size={14} /> Gửi Zalo
            </button>
          </div>

          {/* Thiết kế phiếu thu mô phỏng hóa đơn PDF */}
          <div style={styles.invoicePaper}>
            <div style={styles.invoiceHeader}>
              <h2 style={styles.invoiceMainTitle}>PHIẾU THU TIỀN TRỌ</h2>
              <span style={styles.invoiceSubTitle}>Tháng {selectedBill.rent_month} năm 2026</span>
            </div>

            <div style={styles.invoiceMeta}>
              <div><strong>Phòng:</strong> {rooms.find(r => r.id === selectedBill.room_id)?.name}</div>
              <div><strong>Thời gian lập:</strong> {new Date(selectedBill.at).toLocaleDateString('vi-VN')}</div>
            </div>

            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.tableCellLeft}>Khoản thu</th>
                  <th style={styles.tableCellRight}>Đơn giá</th>
                  <th style={styles.tableCellRight}>Lượng</th>
                  <th style={styles.tableCellRight}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr style={styles.tableRow}>
                  <td style={styles.tableCellLeft}>Tiền phòng</td>
                  <td style={styles.tableCellRight}>{formatVND(selectedBill.price_room)}</td>
                  <td style={styles.tableCellRight}>1</td>
                  <td style={{ ...styles.tableCellRight, fontWeight: '600' }}>{formatVND(selectedBill.price_room)}</td>
                </tr>
                <tr style={styles.tableRow}>
                  <td style={styles.tableCellLeft}>
                    Tiền điện <br />
                    <span style={styles.detailMeter}>
                      ({selectedBill.old_electric} → {selectedBill.new_electric})
                    </span>
                  </td>
                  <td style={styles.tableCellRight}>
                    {formatVND(Number(selectedBill.price_electric))}
                  </td>
                  <td style={styles.tableCellRight}>{selectedBill.electric_consumption} kWh</td>
                  <td style={{ ...styles.tableCellRight, fontWeight: '600' }}>
                    {formatVND(Number(selectedBill.electric_consumption) * Number(selectedBill.price_electric))}
                  </td>
                </tr>
                <tr style={styles.tableRow}>
                  <td style={styles.tableCellLeft}>Tiền nước <br /><span style={styles.detailMeter}>({selectedBill.old_water} → {selectedBill.new_water})</span></td>
                  <td style={styles.tableCellRight}>{formatVND(selectedBill.price_water)}</td>
                  <td style={styles.tableCellRight}>{selectedBill.water_consumption}</td>
                  <td style={{ ...styles.tableCellRight, fontWeight: '600' }}>{formatVND(selectedBill.water_consumption * selectedBill.price_water)}</td>
                </tr>
                <tr style={styles.tableRow}>
                  <td style={styles.tableCellLeft}>Tiền rác & Dịch vụ</td>
                  <td style={styles.tableCellRight}>{formatVND(selectedBill.price_garbage)}</td>
                  <td style={styles.tableCellRight}>1</td>
                  <td style={{ ...styles.tableCellRight, fontWeight: '600' }}>{formatVND(selectedBill.price_garbage)}</td>
                </tr>
              </tbody>
            </table>

            <div style={styles.invoiceTotalContainer}>
              <span style={styles.totalLabel}>TỔNG CỘNG:</span>
              <span style={styles.totalValue}>{formatVND(selectedBill.total_price)}</span>
            </div>

            <div style={styles.invoiceFooter}>
              <div><strong>Người thu:</strong> ĐOÀN VĂN CƯỜNG</div>
              <div style={{ marginTop: 2 }}>SDT: 0985626739</div>
              <div style={{ fontSize: 9, color: '#64748b', marginTop: 12 }}>
                44/24/8 Tăng Nhơn Phú, P. Phước Long B, Tp Thủ Đức, TP HCM
              </div>
            </div>
          </div>

          <button onClick={() => handleDelete(selectedBill.id)} style={styles.btnDeleteBill} className="tap-effect">
            Xóa bỏ hóa đơn này
          </button>
        </div>
      )}

      {/* --- MÀN HÌNH 2: DANH SÁCH LỊCH SỬ --- */}
      {selectedBill === null && activeSubTab === 'list' && (
        <div style={styles.listContainer} className="animate-fade-in">
          {bills.length === 0 ? (
            <div style={styles.emptyState}>
              <FileText size={48} color="var(--text-muted)" style={{ marginBottom: 12 }} />
              <p style={{ color: 'var(--text-muted)' }}>Chưa có hóa đơn nào được lập.</p>
              <button onClick={handleOpenCreate} style={styles.btnEmptyCreate} className="tap-effect">
                Tính hóa đơn đầu tiên
              </button>
            </div>
          ) : (
            <>
              {/* Tiêu đề chọn nhiều */}
              <div style={styles.bulkModeHeader}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', fontFamily: 'var(--font-heading)', letterSpacing: '0.5px' }}>
                  {bulkMode ? `ĐÃ CHỌN: ${selectedBillIds.length} HÓA ĐƠN` : `LỊCH SỬ LẬP HÓA ĐƠN`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (bulkMode) {
                      setBulkMode(false);
                      setSelectedBillIds([]);
                    } else {
                      setBulkMode(true);
                    }
                  }}
                  style={bulkMode ? styles.btnBulkCancel : styles.btnBulkToggle}
                  className="tap-effect"
                >
                  {bulkMode ? 'Hủy' : 'Chọn nhiều'}
                </button>
              </div>

              {/* Thanh hành động chọn nhiều */}
              {bulkMode && (
                <div style={styles.bulkActionBar} className="animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      const filteredIds = filteredBills.map(b => b.id);
                      
                      if (selectedBillIds.length === filteredIds.length) {
                        setSelectedBillIds([]);
                      } else {
                        setSelectedBillIds(filteredIds);
                      }
                    }}
                    style={styles.btnBulkSelectAll}
                    className="tap-effect"
                  >
                    {selectedBillIds.length === filteredBills.length ? 'Hủy chọn tất cả' : 'Chọn tất cả'}
                  </button>

                  <button
                    type="button"
                    onClick={handleBulkExportPDF}
                    disabled={selectedBillIds.length === 0 || bulkExporting}
                    style={selectedBillIds.length === 0 ? styles.btnBulkExportDisabled : styles.btnBulkExport}
                    className="tap-effect"
                  >
                    {bulkExporting ? (
                      <span>{bulkExportProgress}</span>
                    ) : (
                      <span>📥 Xuất {selectedBillIds.length} PDF</span>
                    )}
                  </button>
                </div>
              )}

              {/* Thanh Tìm kiếm nhanh */}
              <div style={styles.searchSection}>
                <div style={styles.searchBox}>
                  <Search size={16} color="var(--text-muted)" style={{ marginLeft: '10px' }} />
                  <input
                    type="text"
                    placeholder="Tìm hóa đơn theo phòng, ghi chú..."
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

              {/* Thanh bộ lọc lịch sử trọ */}
              <div style={styles.filterBar}>
                <select
                  value={filterRoomId}
                  onChange={(e) => {
                    setFilterRoomId(e.target.value);
                    if (bulkMode) setSelectedBillIds([]); // Reset selection on filter change
                  }}
                  style={styles.filterSelect}
                >
                  <option value="all">Tất cả phòng</option>
                  {[...rooms].sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true})).map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>

                <select
                  value={filterMonth}
                  onChange={(e) => {
                    setFilterMonth(e.target.value);
                    if (bulkMode) setSelectedBillIds([]); // Reset selection on filter change
                  }}
                  style={styles.filterSelect}
                >
                  <option value="all">Tất cả tháng</option>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <option key={m} value={m}>Tháng {m}</option>
                  ))}
                </select>
              </div>

              {/* Danh sách hóa đơn đã được lọc */}
              {(() => {

                if (filteredBills.length === 0) {
                  return (
                    <div style={{ ...styles.emptyState, padding: '20px' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Không có hóa đơn nào khớp bộ lọc.</p>
                    </div>
                  );
                }

                return (
                  <div style={styles.historyList}>
                    {filteredBills.map((bill) => {
                      const roomName = rooms.find(r => r.id === bill.room_id)?.name || 'Phòng ẩn';
                      const isSelected = selectedBillIds.includes(bill.id);
                      
                      return (
                        <div
                          key={bill.id}
                          onClick={() => {
                            if (bulkMode) {
                              if (isSelected) {
                                setSelectedBillIds(selectedBillIds.filter(id => id !== bill.id));
                              } else {
                                setSelectedBillIds([...selectedBillIds, bill.id]);
                              }
                            } else {
                              setSelectedBill(bill);
                            }
                          }}
                          style={{
                            ...styles.billItem,
                            border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                            backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)'
                          }}
                          className="tap-effect"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                            {bulkMode && (
                              <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '6px',
                                border: isSelected ? '2px solid var(--primary)' : '2px solid var(--text-muted)',
                                backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease',
                                flexShrink: 0
                              }}>
                                {isSelected && (
                                  <CheckCircle2 size={12} color="#0f172a" style={{ strokeWidth: 3 }} />
                                )}
                              </div>
                            )}
                            <div style={styles.billLeft}>
                              <div style={styles.billRoom}>{roomName}</div>
                              <div style={styles.billDate}>Tháng {bill.rent_month} • {new Date(bill.at).toLocaleDateString('vi-VN')}</div>
                            </div>
                          </div>
                          <div style={styles.billRight}>
                            <span style={styles.billPriceText}>{formatVND(bill.total_price)}</span>
                            {!bulkMode && <ChevronRight size={16} color="var(--text-muted)" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}

      {/* --- MÀN HÌNH 3: BỘ TÍNH TIỀN THÔNG MINH (CREATE) --- */}
      {selectedBill === null && activeSubTab === 'create' && (
        <form onSubmit={handleCalculateSave} style={styles.form} className="animate-fade-in">
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Chọn phòng tính tiền</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={styles.select}
              required
            >
              {[...rooms].sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true})).map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Tháng thu tiền phòng</label>
            <select
              value={rentMonth}
              onChange={(e) => setRentMonth(e.target.value)}
              style={styles.select}
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>

          {/* Chỉ số điện */}
          <div style={styles.calculatorSection}>
            <h4 style={styles.sectionHeading}>⚡ CHỈ SỐ ĐIỆN</h4>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Số điện cũ</label>
                <input
                  type="number"
                  value={oldElectric}
                  onChange={(e) => setOldElectric(e.target.value)}
                  style={styles.inputDisabled}
                  disabled
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Số điện mới</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Nhập số điện mới"
                    value={newElectric}
                    onChange={(e) => setNewElectric(e.target.value)}
                    style={{ ...styles.inputHighlight, paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleStartScan('electric')}
                    style={styles.inputScanBtn}
                    className="tap-effect"
                    title="Chụp ảnh quét số điện bằng AI"
                  >
                    <Camera size={15} />
                  </button>
                </div>
                {newElectric !== '' && Number(newElectric) < Number(oldElectric) && (
                  <div style={styles.inputWarning}>
                    ⚠️ Số mới ({newElectric}) nhỏ hơn số cũ ({oldElectric})!
                  </div>
                )}
              </div>
            </div>
            <div style={styles.calcResults}>
              Tiêu thụ: <strong>{electricConsumption} kWh</strong> x <strong>{formatVND(priceElectric)}</strong> = <strong>
                {formatVND(electricConsumption * priceElectric)}
              </strong>
            </div>
          </div>

          {/* Chỉ số nước */}
          <div style={styles.calculatorSection}>
            <h4 style={styles.sectionHeading}>💧 CHỈ SỐ NƯỚC</h4>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Số nước cũ</label>
                <input
                  type="number"
                  value={oldWater}
                  onChange={(e) => setOldWater(e.target.value)}
                  style={styles.inputDisabled}
                  disabled
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Số nước mới</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Nhập số nước mới"
                    value={newWater}
                    onChange={(e) => setNewWater(e.target.value)}
                    style={{ ...styles.inputHighlight, paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleStartScan('water')}
                    style={styles.inputScanBtn}
                    className="tap-effect"
                    title="Chụp ảnh quét số nước bằng AI"
                  >
                    <Camera size={15} />
                  </button>
                </div>
                {newWater !== '' && Number(newWater) < Number(oldWater) && (
                  <div style={styles.inputWarning}>
                    ⚠️ Số mới ({newWater}) nhỏ hơn số cũ ({oldWater})!
                  </div>
                )}
              </div>
            </div>
            <div style={styles.calcResults}>
              Tiêu thụ: <strong>{waterConsumption} m³</strong> x {formatVND(priceWater)} = <strong>{formatVND(waterConsumption * priceWater)}</strong>
            </div>
          </div>

          {/* Tổng kết tiền trọ mặc định */}
          <div style={styles.summaryBox}>
            <div style={styles.summaryItem}>
              <span>Tiền phòng gốc:</span>
              <span>{formatVND(priceRoom)}</span>
            </div>
            <div style={styles.summaryItem}>
              <span>Tiền rác & dịch vụ:</span>
              <span>{formatVND(priceGarbage)}</span>
            </div>
            <div style={styles.summaryItem}>
              <span>Tiền điện tiêu thụ:</span>
              <span>{formatVND(electricConsumption * priceElectric)}</span>
            </div>
            <div style={styles.summaryItem}>
              <span>Tiền nước tiêu thụ:</span>
              <span>{formatVND(waterConsumption * priceWater)}</span>
            </div>
            
            <div style={styles.formGroup} style={{ marginTop: '8px' }}>
              <label style={styles.formLabel}>Ghi chú hóa đơn</label>
              <input
                type="text"
                placeholder="Ghi chú thêm..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.totalBox}>
              <span>TỔNG CỘNG TIỀN TRỌ:</span>
              <span style={styles.totalPriceText}>{formatVND(totalPrice)}</span>
            </div>
          </div>

          <button type="submit" style={styles.btnSubmitBill} className="tap-effect">
            <CheckCircle2 size={16} style={{ marginRight: 6 }} /> Xác nhận & Lưu hóa đơn
          </button>
        </form>
      )}

      {/* --- MODAL QUÉT CHỈ SỐ BẰNG AI (OCR MODAL) --- */}
      {ocrModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, maxHeight: '90%' }} className="animate-slide-up">
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>🔍 QUÉT CHỈ SỐ BẰNG CAMERA</h3>
              <button 
                type="button" 
                onClick={() => setOcrModalOpen(false)} 
                style={styles.closeBtn} 
                className="tap-effect"
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.ocrBody}>
              {ocrImage && (
                <div style={styles.ocrImageContainer}>
                  <img src={ocrImage} alt="Meter preview" style={styles.ocrPreviewImage} />
                  {ocrLoading && (
                    <div style={styles.ocrLoadingOverlay}>
                      <div style={styles.ocrSpinner} />
                      <span style={styles.ocrProgressText}>🤖 Đang quét: {ocrProgress}%</span>
                    </div>
                  )}
                </div>
              )}

              {!ocrLoading && ocrCandidates.length === 0 && (
                <div style={styles.ocrStatusError}>
                  ⚠️ Không tự động nhận diện được dãy số phù hợp. Vui lòng chụp thẳng góc, rõ nét hoặc chọn nhập tay.
                </div>
              )}

              {!ocrLoading && ocrCandidates.length > 0 && (
                <div style={styles.ocrSuccessBox}>
                  <h5 style={styles.ocrCandidatesTitle}>🎯 Chọn số đo đọc được từ ảnh:</h5>
                  <div style={styles.ocrCandidatesGrid}>
                    {ocrCandidates.map((val, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => fillOcrValue(val)}
                        style={styles.ocrCandidateBtn}
                        className="tap-effect"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <p style={styles.ocrTipText}>Mẹo: Nhấp vào số chính xác trên đồng hồ để điền nhanh.</p>
                </div>
              )}

              <div style={styles.ocrActionsRow}>
                <button
                  type="button"
                  onClick={() => handleStartScan(ocrTargetField)}
                  style={styles.ocrReBtn}
                  className="tap-effect"
                >
                  Chụp lại ảnh
                </button>
                <button
                  type="button"
                  onClick={() => setOcrModalOpen(false)}
                  style={styles.ocrCloseBtn}
                  className="tap-effect"
                >
                  Nhập tay thủ công
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  bulkModeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    padding: '0 4px',
  },
  btnBulkToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-light)',
    color: '#f8fafc',
    borderRadius: '8px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnBulkCancel: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    color: '#f43f5e',
    borderRadius: '8px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  bulkActionBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '12px',
    width: '100%',
  },
  btnBulkSelectAll: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-light)',
    color: 'var(--text-main)',
    borderRadius: '10px',
    padding: '10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnBulkExport: {
    flex: 1.5,
    backgroundColor: 'var(--primary)',
    color: 'var(--text-inverse)',
    border: 'none',
    borderRadius: '10px',
    padding: '10px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 10px var(--primary-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  btnBulkExportDisabled: {
    flex: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '10px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
  tabHeader: {
    display: 'flex',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    border: '1px solid var(--border-light)',
    overflow: 'hidden',
  },
  tabLink: {
    flex: 1,
    padding: '12px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    textAlign: 'center',
  },
  btnEmptyCreate: {
    backgroundColor: 'var(--primary)',
    color: 'var(--text-inverse)',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 20px',
    fontSize: '12px',
    fontWeight: '700',
    marginTop: '16px',
    cursor: 'pointer',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  filterBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '12px',
    width: '100%',
  },
  filterSelect: {
    flex: 1,
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '8px 10px',
    color: 'var(--text-main)',
    fontSize: '12px',
    outline: 'none',
    cursor: 'pointer',
  },
  billItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: '14px',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
  },
  billLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  billRoom: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  billDate: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  billRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  billPriceText: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  // Invoice Styles
  invoiceView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  invoiceActions: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  btnBack: {
    flex: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '8px',
    color: '#f8fafc',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  btnPdf: {
    flex: 1.25,
    backgroundColor: 'var(--accent)',
    border: 'none',
    borderRadius: '10px',
    padding: '8px',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.25)',
  },
  btnCopy: {
    flex: 1.25,
    backgroundColor: 'var(--primary)',
    border: 'none',
    borderRadius: '10px',
    padding: '8px',
    color: '#0f172a',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 4px 10px var(--primary-glow)',
  },
  invoicePaper: {
    backgroundColor: '#ffffff', // Giấy hóa đơn trắng chuẩn
    color: '#1e293b',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
    backgroundSize: '16px 16px',
  },
  invoiceHeader: {
    textAlign: 'center',
    borderBottom: '2px dashed #cbd5e1',
    paddingBottom: '12px',
  },
  invoiceMainTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '0.5px',
  },
  invoiceSubTitle: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
    marginTop: '2px',
    display: 'block',
  },
  invoiceMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  tableHead: {
    borderBottom: '1.5px solid #0f172a',
  },
  tableCellLeft: {
    textAlign: 'left',
    padding: '6px 8px',
    color: '#0f172a',
    fontWeight: '700',
  },
  tableCellRight: {
    textAlign: 'right',
    padding: '6px 8px',
    color: '#1e293b',
  },
  detailMeter: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: 'normal',
  },
  tableRow: {
    borderBottom: '1px solid #e2e8f0',
  },
  invoiceTotalContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '2px dashed #cbd5e1',
    paddingTop: '12px',
    marginTop: '4px',
  },
  totalLabel: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#10b981',
  },
  invoiceFooter: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#475569',
    marginTop: '8px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '10px',
  },
  btnDeleteBill: {
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    color: '#f43f5e',
    borderRadius: '10px',
    padding: '10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '6px',
  },
  // Form Styles
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
    minWidth: 0,
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
  select: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '10px 12px',
    color: 'var(--text-main)',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
  },
  input: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '10px 12px',
    color: 'var(--text-main)',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
    padding: '10px 12px',
    color: 'var(--text-muted)',
    fontSize: '13px',
    cursor: 'not-allowed',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputHighlight: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--primary)',
    borderRadius: '10px',
    padding: '10px 12px',
    color: 'var(--text-main)',
    fontSize: '13px',
    outline: 'none',
    boxShadow: '0 0 4px var(--primary-glow)',
    width: '100%',
    boxSizing: 'border-box',
  },
  calculatorSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-light)',
    borderRadius: '14px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionHeading: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  calcResults: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textAlign: 'right',
  },
  summaryBox: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: '16px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backdropFilter: 'blur(10px)',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  totalBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-light)',
    paddingTop: '10px',
    marginTop: '4px',
  },
  totalPriceText: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--primary)',
  },
  btnSubmitBill: {
    backgroundColor: 'var(--primary)',
    color: 'var(--text-inverse)',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px var(--primary-glow)',
  },
  inputScanBtn: {
    position: 'absolute',
    right: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    outline: 'none',
  },
  ocrBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
    padding: '10px 0',
    width: '100%',
  },
  ocrImageContainer: {
    position: 'relative',
    width: '100%',
    height: '200px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid var(--border-light)',
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ocrPreviewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  ocrLoadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(9, 13, 22, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backdropFilter: 'blur(3px)',
  },
  ocrSpinner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid rgba(16, 185, 129, 0.2)',
    borderTopColor: 'var(--primary)',
    animation: 'spin 1s linear infinite',
  },
  ocrProgressText: {
    fontSize: '13px',
    color: '#ffffff',
    fontWeight: '700',
  },
  ocrSuccessBox: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-light)',
    borderRadius: '12px',
    padding: '12px',
    boxSizing: 'border-box',
  },
  ocrCandidatesTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  ocrCandidatesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  ocrCandidateBtn: {
    backgroundColor: 'var(--primary)',
    color: '#0f172a',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 8px var(--primary-glow)',
  },
  ocrTipText: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    marginTop: '2px',
  },
  ocrStatusError: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    borderRadius: '12px',
    color: '#f43f5e',
    fontSize: '11px',
    lineHeight: '1.4',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  ocrActionsRow: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    marginTop: '6px',
  },
  ocrReBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '10px',
    color: '#f8fafc',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  ocrCloseBtn: {
    flex: 1,
    backgroundColor: 'var(--accent)',
    border: 'none',
    borderRadius: '10px',
    padding: '10px',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.25)',
  },
  inputWarning: {
    color: '#f43f5e',
    fontSize: '11px',
    fontWeight: '600',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    width: '100%',
  },
  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '10px',
    width: '100%',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    height: '36px',
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-main)',
    fontSize: '12px',
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
};
