import React, { useState, useEffect } from 'react';
import { Plus, X, Calculator, Eye, FileText, CheckCircle2, ChevronRight, Copy, Share2, CornerUpLeft } from 'lucide-react';

export default function Bills({ bills, rooms, onSaveBill, onDeleteBill }) {
  const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' or 'create'
  const [selectedBill, setSelectedBill] = useState(null); // Để hiển thị hóa đơn chi tiết

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

  // Tự động tính lượng tiêu thụ và tổng tiền khi nhập chỉ số mới
  useEffect(() => {
    const elecCons = Math.max(0, Number(newElectric || 0) - Number(oldElectric || 0));
    const waterCons = Math.max(0, Number(newWater || 0) - Number(oldWater || 0));
    
    setElectricConsumption(elecCons);
    setWaterConsumption(waterCons);
    
    // Tính toán tiền điện bậc thang lũy tiến (Tier 1 = price - 500, Tier 2 = price)
    const basePriceElec = Number(priceElectric);
    const tier1Price = basePriceElec - 500;
    const tier2Price = basePriceElec;
    let elecBill = 0;
    
    if (elecCons > 100) {
      elecBill = (100 * tier1Price) + ((elecCons - 100) * tier2Price);
    } else {
      elecBill = elecCons * tier1Price;
    }
    
    const calculatedTotal = elecBill + (waterCons * Number(priceWater)) + Number(priceRoom) + Number(priceGarbage);
    setTotalPrice(calculatedTotal);
  }, [newElectric, oldElectric, newWater, oldWater, priceElectric, priceWater, priceRoom, priceGarbage]);

  // Khởi động khi mở tab tạo mới
  const handleOpenCreate = () => {
    if (rooms.length > 0) {
      setRoomId(rooms[0].id.toString());
    }
    setRentMonth(new Date().getMonth() + 1);
    setNote('');
    setActiveSubTab('create');
    setSelectedBill(null);
  };

  const handleCalculateSave = (e) => {
    e.preventDefault();
    if (!roomId || rooms.length === 0) {
      alert('Vui lòng tạo ít nhất một phòng trọ trong tab "Phòng trọ" trước khi tính tiền!');
      return;
    }
    if (Number(newElectric) < Number(oldElectric)) {
      alert('Số điện mới không được nhỏ hơn số điện cũ!');
      return;
    }
    if (Number(newWater) < Number(oldWater)) {
      alert('Số nước mới không được nhỏ hơn số nước cũ!');
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
      alert('Lưu hóa đơn và tính tiền thành công!');
    }, 100);
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
    
    // Tính toán tiền điện lũy tiến gửi Zalo (Tier 1 = price - 500, Tier 2 = price)
    const cons = Number(bill.electric_consumption);
    const basePrice = Number(bill.price_electric);
    const tier1Price = basePrice - 500;
    const tier2Price = basePrice;
    let elecCost = 0;
    let elecDetail = '';
    if (cons > 100) {
      elecCost = (100 * tier1Price) + (cons - 100) * tier2Price;
      elecDetail = `(100 kWh x ${formatVND(tier1Price)} + ${cons - 100} kWh x ${formatVND(tier2Price)}) = ${formatVND(elecCost)}`;
    } else {
      elecCost = cons * tier1Price;
      elecDetail = `${cons} kWh x ${formatVND(tier1Price)} = ${formatVND(elecCost)}`;
    }

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

    navigator.clipboard.writeText(shareText);
    alert('Đã sao chép nội dung tóm tắt hóa đơn! Bạn có thể dán (Paste) để gửi ngay qua Zalo hoặc SMS cho khách thuê.');
  };

  // Xuất hóa đơn ra PDF (Liên kết API trực tiếp nếu Online, In trực quan nếu Offline)
  const handleExportPDF = (bill) => {
    const rName = rooms.find(r => r.id === bill.room_id)?.name || '';
    const syncConfig = JSON.parse(localStorage.getItem('tropay_sync_config') || '{}');
    
    if (syncConfig && syncConfig.enabled && syncConfig.apiUrl) {
      // 1. Chế độ ONLINE: Gọi tải trực tiếp từ máy chủ DomPDF của bạn
      const baseUrl = syncConfig.apiUrl.replace(/\/api$/, '').replace(/\/$/, '');
      const downloadUrl = `${baseUrl}/pdf/${bill.id}/download`;
      window.open(downloadUrl, '_blank');
    } else {
      // 2. Chế độ OFFLINE: Kết xuất phiếu in HTML và mở trình in PDF của trình duyệt
      const printWindow = window.open('', '_blank', 'width=800,height=700');
      if (!printWindow) {
        alert('Trình duyệt đã chặn cửa sổ bật lên. Vui lòng cấp quyền Pop-up để xuất PDF!');
        return;
      }

      // Tính toán lượng tiêu thụ điện lũy tiến cho bản in PDF offline (Tier 1 = price - 500, Tier 2 = price)
      const cons = Number(bill.electric_consumption);
      const basePrice = Number(bill.price_electric);
      const tier1Price = basePrice - 500;
      const tier2Price = basePrice;
      let elecCost = 0;
      let elecDetailHtml = `Chỉ số: ${bill.old_electric} → ${bill.new_electric} = ${cons} kWh`;
      let elecUnitPriceText = formatVND(tier1Price);
      
      if (cons > 100) {
        elecCost = (100 * tier1Price) + (cons - 100) * tier2Price;
        elecDetailHtml += `<br/><span style="font-size:10px;color:#64748b;font-weight:normal;">(100 x ${formatVND(tier1Price)} + ${cons - 100} x ${formatVND(tier2Price)})</span>`;
        elecUnitPriceText = 'Lũy tiến';
      } else {
        elecCost = cons * tier1Price;
      }
      
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
                      ({selectedBill.old_electric} → {selectedBill.new_electric}) = {selectedBill.electric_consumption} kWh
                      {Number(selectedBill.electric_consumption) > 100 && (
                        <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)', marginTop: 2 }}>
                          (100 x {formatVND(Number(selectedBill.price_electric) - 500)} + {Number(selectedBill.electric_consumption) - 100} x {formatVND(Number(selectedBill.price_electric))})
                        </span>
                      )}
                    </span>
                  </td>
                  <td style={styles.tableCellRight}>
                    {Number(selectedBill.electric_consumption) > 100 ? 'Lũy tiến' : formatVND(Number(selectedBill.price_electric) - 500)}
                  </td>
                  <td style={styles.tableCellRight}>{selectedBill.electric_consumption}</td>
                  <td style={{ ...styles.tableCellRight, fontWeight: '600' }}>
                    {(() => {
                      const cons = Number(selectedBill.electric_consumption);
                      const basePrice = Number(selectedBill.price_electric);
                      const tier1 = basePrice - 500;
                      const tier2 = basePrice;
                      const cost = cons > 100 ? (100 * tier1) + (cons - 100) * tier2 : cons * tier1;
                      return formatVND(cost);
                    })()}
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
              {/* Thanh bộ lọc lịch sử trọ */}
              <div style={styles.filterBar}>
                <select
                  value={filterRoomId}
                  onChange={(e) => setFilterRoomId(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="all">Tất cả phòng</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>

                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
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
                const filteredBills = [...bills]
                  .filter((bill) => {
                    const matchesRoom = filterRoomId === 'all' || Number(bill.room_id) === Number(filterRoomId);
                    const matchesMonth = filterMonth === 'all' || Number(bill.rent_month) === Number(filterMonth);
                    return matchesRoom && matchesMonth;
                  })
                  .sort((a, b) => new Date(b.at) - new Date(a.at));

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
                      return (
                        <div
                          key={bill.id}
                          onClick={() => setSelectedBill(bill)}
                          style={styles.billItem}
                          className="tap-effect"
                        >
                          <div style={styles.billLeft}>
                            <div style={styles.billRoom}>{roomName}</div>
                            <div style={styles.billDate}>Tháng {bill.rent_month} • {new Date(bill.at).toLocaleDateString('vi-VN')}</div>
                          </div>
                          <div style={styles.billRight}>
                            <span style={styles.billPriceText}>{formatVND(bill.total_price)}</span>
                            <ChevronRight size={16} color="var(--text-muted)" />
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
              {rooms.map(room => (
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
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Nhập số điện mới"
                  value={newElectric}
                  onChange={(e) => setNewElectric(e.target.value)}
                  style={styles.inputHighlight}
                />
              </div>
            </div>
            <div style={styles.calcResults}>
              Tiêu thụ: <strong>{electricConsumption} kWh</strong> 
              {electricConsumption > 100 ? (
                <span> (100 x {formatVND(priceElectric - 500)} + {electricConsumption - 100} x {formatVND(priceElectric)})</span>
              ) : (
                <span> x {formatVND(priceElectric - 500)}</span>
              )} = <strong>
                {(() => {
                  const cons = electricConsumption;
                  const basePrice = priceElectric;
                  const tier1 = basePrice - 500;
                  const tier2 = basePrice;
                  const cost = cons > 100 ? (100 * tier1) + (cons - 100) * tier2 : cons * tier1;
                  return formatVND(cost);
                })()}
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
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Nhập số nước mới"
                  value={newWater}
                  onChange={(e) => setNewWater(e.target.value)}
                  style={styles.inputHighlight}
                />
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
              <span>
                {(() => {
                  const cons = electricConsumption;
                  const basePrice = priceElectric;
                  const tier1 = basePrice - 500;
                  const tier2 = basePrice;
                  const cost = cons > 100 ? (100 * tier1) + (cons - 100) * tier2 : cons * tier1;
                  return formatVND(cost);
                })()}
              </span>
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

    </div>
  );
}

const styles = {
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
    color: '#0f172a',
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
    color: '#f8fafc',
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
    color: '#f8fafc',
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
    color: '#f8fafc',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
  },
  input: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '10px 12px',
    color: '#f8fafc',
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
    color: '#f8fafc',
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
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
    color: '#0f172a',
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
  }
};
