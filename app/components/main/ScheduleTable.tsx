'use client';

import { useEffect, useState } from 'react';
import { useSchedule } from '@/app/context/ScheduleContext';
import { hexToRgba, getShiftColorStyle, shiftColors } from '@/app/utils/colors';

// Global tanımlar
declare global {
  interface Window {
    showCellEditModal?: (
      employeeId: string,
      employeeName: string,
      day: number,
      date: string,
    ) => void;
  }
}

export default function ScheduleTable() {
  const { employees, schedule, shiftTypes, selectedMonth, selectedYear } = useSchedule();
  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);
  const [weekDays, setWeekDays] = useState<string[]>([]);

  // Sayfa yüklendiğinde vardiyal modal fonksiyonunun var olup olmadığını kontrol et
  useEffect(() => {
    // Modal fonksiyonunu kontrol et
    console.log('ScheduleTable yüklendi, showCellEditModal mevcut mu:', !!window.showCellEditModal);

    // Modal elementi var mı kontrol et
    const modalElement = document.getElementById('cell-edit-modal');
    console.log('Modal elementi mevcut mu:', !!modalElement);
  }, []);

  useEffect(() => {
    // Seçilen ayın gün sayısı
    const totalDays = new Date(selectedYear, selectedMonth, 0).getDate();

    // Günleri dizi olarak oluştur (1-31)
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    setDaysInMonth(days);

    // Her gün için haftanın günü bilgisini hazırla
    const weekDayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const weekDaysForMonth = days.map((day) => {
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = date.getDay();
      // getDay() 0=Pazar, 6=Cumartesi olarak döner, düzeltme yapalım
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      return weekDayNames[adjustedDay];
    });

    setWeekDays(weekDaysForMonth);
  }, [selectedMonth, selectedYear]);

  // Tablo oluşturulduktan sonra hücrelere tıklama olayı ekle
  useEffect(() => {
    // Tabloyu yükledikten sonra hücrelere tıklama olay dinleyicisi ekle
    const tableContainer = document.querySelector('.schedule-table-container');
    console.log('Tablo konteyneri bulundu mu:', !!tableContainer);

    if (tableContainer) {
      // Tablo hücrelerine tıklama olayını işleyen fonksiyon
      const handleCellClick = (e: Event) => {
        try {
          const mouseEvent = e as MouseEvent;
          // Tıklanan hücre veya alt elemanları
          let target = mouseEvent.target as HTMLElement;
          console.log('Hücreye tıklandı, hedef:', target.tagName);

          // Tıklanan elemanın hücre veya alt elemanı olup olmadığını kontrol et
          while (target && target !== tableContainer) {
            // Eğer hücre içindeki div'e tıklandıysa, bir üst seviyedeki td'yi bul
            if (target.tagName === 'DIV' && target.parentElement?.tagName === 'TD') {
              target = target.parentElement;
              console.log('Div içindeki eleman tıklandı, TD hedefine geçildi');
            }

            // Eğer td ise ve gereken veri özellikleri varsa, modalı aç
            if (
              target.tagName === 'TD' &&
              target.hasAttribute('data-employee-id') &&
              target.hasAttribute('data-day')
            ) {
              const employeeId = target.getAttribute('data-employee-id') || '';
              const day = parseInt(target.getAttribute('data-day') || '0', 10);
              console.log('Geçerli hücre bulundu:', { employeeId, day });

              // Çalışan adını bul
              const employee = employees.find((emp) => emp.id === employeeId);
              if (!employee) {
                console.error('Çalışan bulunamadı:', employeeId);
                return;
              }

              // Tarih bilgisini hazırla
              const date = new Date(selectedYear, selectedMonth - 1, day);
              const formattedDate = date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              });

              console.log('Modal açılacak:', {
                employeeId,
                employeeName: employee.adSoyad,
                day,
                formattedDate,
              });

              // Global showCellEditModal fonksiyonunu çağır
              if (window.showCellEditModal) {
                window.showCellEditModal(employeeId, employee.adSoyad, day, formattedDate);
              } else {
                console.error('showCellEditModal fonksiyonu bulunamadı. Fonksiyon tanımlı değil.');

                // Modal manuel olarak açılmaya çalışılıyor
                const modal = document.getElementById('cell-edit-modal');
                if (modal) {
                  console.log('showCellEditModal bulunamadı, modal manuel olarak açılıyor');
                  modal.classList.remove('hidden');

                  // Modal içindeki bazı bilgileri manuel güncelle
                  const titleElement = document.getElementById('cell-edit-title');
                  if (titleElement) {
                    titleElement.textContent = `${employee.adSoyad} - ${formattedDate}`;
                  }

                  const infoElement = document.getElementById('cell-edit-info');
                  if (infoElement) {
                    infoElement.textContent = 'Düzenlemek için bir seçenek seçin';
                  }
                } else {
                  console.error('Modal elementi de bulunamadı: cell-edit-modal');
                  alert(
                    'Vardiya düzenleme modalı yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.',
                  );
                }
              }

              break;
            }

            // Üst elemana geç
            target = target.parentElement as HTMLElement;
          }
        } catch (error) {
          console.error('Hücre tıklama işleminde hata:', error);
        }
      };

      // Tıklama olayını ekle
      tableContainer.addEventListener('click', handleCellClick);
      console.log('Tıklama olay dinleyicisi eklendi');

      // Temizleme işlevi
      return () => {
        tableContainer.removeEventListener('click', handleCellClick);
        console.log('Tıklama olay dinleyicisi kaldırıldı');
      };
    }
  }, [employees, selectedMonth, selectedYear]);

  // Vardiya rengini getir
  const getShiftColor = (code: string) => {
    const shift = shiftTypes.find((s) => s.code === code);
    return shift ? shift.color : 'gray';
  };

  // Hücre değerini formatlı şekilde döndür
  const getFormattedCellValue = (cellValue: string) => {
    // İzin kodları
    if (['HT', 'YI', 'UI', 'R', 'MZ', 'RT'].includes(cellValue)) {
      let leaveText = '';
      let colorName = '';

      switch (cellValue) {
        case 'HT':
          leaveText = 'Hafta Tatili';
          colorName = 'yellow';
          break;
        case 'YI':
          leaveText = 'Yıllık İzin';
          colorName = 'emerald';
          break;
        case 'UI':
          leaveText = 'Ücretsiz İzin';
          colorName = 'rose';
          break;
        case 'R':
          leaveText = 'Rapor';
          colorName = 'red';
          break;
        case 'MZ':
          leaveText = 'Mazeret';
          colorName = 'indigo';
          break;
        case 'RT':
          leaveText = 'Resmi Tatil';
          colorName = 'orange';
          break;
        default:
          colorName = 'gray';
      }

      // İzin kodları için stil
      const colorStyle = getShiftColorStyle(colorName, 'vardiyaTipleri');

      return {
        content: cellValue,
        className: 'hover:text-black tooltip-trigger',
        style: {
          backgroundColor: colorStyle.backgroundColor,
          color: colorStyle.color,
          cursor: 'pointer',
        },
        tooltip: leaveText,
      };
    }

    // Vardiya kodu ise
    const shift = shiftTypes.find((s) => s.code === cellValue);
    if (shift) {
      // Çizelge hücreleri için renk stilini getir
      const colorStyle = getShiftColorStyle(shift.color, 'scheduleCell');

      return {
        content: shift.code,
        className: 'font-bold tooltip-trigger hover:opacity-90',
        style: {
          backgroundColor: colorStyle.backgroundColor,
          color: colorStyle.color,
          border: `1px solid ${hexToRgba(colorStyle.color, 0.3)}`,
          borderRadius: '0.5rem', // daha yuvarlak köşeler
          padding: '0px',
          fontWeight: 'bold',
          cursor: 'pointer',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 2px 4px ${hexToRgba(colorStyle.color, 0.2)}`,
          transition: 'all 0.2s ease-in-out',
        },
        tooltip: shift.name,
      };
    }

    return { content: cellValue, className: '', style: {}, tooltip: '' };
  };

  // Çalışanın vardiya istatistiklerini hesapla
  const calculateEmployeeStats = (employeeId: string) => {
    // Eğer bu çalışan için henüz çizelge yoksa, boş değerler döndür
    if (!schedule[employeeId]) {
      return {
        totalWorkDays: 0,
        totalWorkHours: 0,
        shiftCounts: {},
        shiftHours: {},
      };
    }

    const employeeShifts = schedule[employeeId];
    const stats = {
      totalWorkDays: 0,
      totalWorkHours: 0,
      shiftCounts: {} as Record<string, number>,
      shiftHours: {} as Record<string, number>,
    };

    // Her bir gün için hesapla
    employeeShifts.forEach((shiftCode, dayIndex) => {
      // 0. indeks boş, 1'den başla
      if (dayIndex === 0 || !shiftCode) return;

      // İzin veya tatil günleri
      if (['HT', 'YI', 'UI', 'R', 'MZ', 'RT'].includes(shiftCode)) {
        // İzin günlerini hesaplama, sadece sayıları tut
        if (!stats.shiftCounts[shiftCode]) {
          stats.shiftCounts[shiftCode] = 0;
        }
        stats.shiftCounts[shiftCode]++;
        return;
      }

      // Vardiya günlerini hesapla
      const shift = shiftTypes.find((s) => s.code === shiftCode);
      if (shift) {
        // Vardiya sayısını artır
        if (!stats.shiftCounts[shift.code]) {
          stats.shiftCounts[shift.code] = 0;
          stats.shiftHours[shift.code] = 0;
        }
        stats.shiftCounts[shift.code]++;
        stats.totalWorkDays++;

        // Vardiya saatlerini hesapla
        let hours = 0;
        if (shift.startTime && shift.endTime) {
          const startParts = shift.startTime.split(':').map(Number);
          const endParts = shift.endTime.split(':').map(Number);

          const startHour = startParts[0];
          const startMinute = startParts[1] || 0;
          const endHour = endParts[0];
          const endMinute = endParts[1] || 0;

          let hourDiff = endHour - startHour;
          let minuteDiff = endMinute - startMinute;

          // Eğer 24 saat geçiyorsa (örn: 20:00-08:00)
          if (hourDiff < 0 || (hourDiff === 0 && minuteDiff < 0)) {
            hourDiff += 24;
          }

          // Dakikaları saate çevir
          hours = hourDiff + minuteDiff / 60;
        }

        stats.shiftHours[shift.code] += hours;
        stats.totalWorkHours += hours;
      }
    });

    return stats;
  };

  // Shift türüne göre arka plan rengi belirleme
  const getBackgroundColor = (code: string) => {
    // Vardiya kodu yoksa boş döndür
    if (!code) return '';

    // Vardiya tipini bul
    const shiftType = shiftTypes.find((s) => s.code === code);

    // Vardiya tipi bulunamadıysa boş döndür
    if (!shiftType) return '';

    // Hex kodu kontrolü
    if (shiftType.color && shiftType.color.startsWith('#')) {
      // Hex rengi RGBA'ya dönüştürerek %15 opaklıkta döndür
      return hexToRgba(shiftType.color, 0.15);
    }

    // Tailwind renk sınıfı için
    return `bg-${shiftType.color}-100`;
  };

  // Shift türüne göre metin rengi belirleme
  const getTextColor = (code: string) => {
    // Vardiya kodu yoksa boş döndür
    if (!code) return '';

    // Vardiya tipini bul
    const shiftType = shiftTypes.find((s) => s.code === code);

    // Vardiya tipi bulunamadıysa boş döndür
    if (!shiftType) return '';

    // Hex kodu kontrolü
    if (shiftType.color && shiftType.color.startsWith('#')) {
      return shiftType.color; // Doğrudan hex rengini döndür
    }

    // Tailwind renk sınıfı için
    return `text-${shiftType.color}-700`;
  };

  // Shift türüne göre kenarlık rengi belirleme
  const getBorderColor = (code: string) => {
    // Vardiya kodu yoksa boş döndür
    if (!code) return '';

    // Vardiya tipini bul
    const shiftType = shiftTypes.find((s) => s.code === code);

    // Vardiya tipi bulunamadıysa boş döndür
    if (!shiftType) return '';

    // Hex kodu kontrolü
    if (shiftType.color && shiftType.color.startsWith('#')) {
      return shiftType.color; // Doğrudan hex rengini döndür
    }

    // Tailwind renk sınıfı için
    return `border-${shiftType.color}-300`;
  };

  // Modal açma fonksiyonu
  const openShiftModal = ({
    employeeId,
    day,
    month,
    year,
  }: {
    employeeId: number | string;
    day: number;
    month: number;
    year: number;
  }) => {
    // Çalışan bilgilerini bul
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) {
      console.error('Çalışan bulunamadı:', employeeId);
      return;
    }

    // Tarih bilgisini hazırla
    const date = new Date(year, month - 1, day);
    const formattedDate = date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    // Global showCellEditModal fonksiyonunu çağır
    if (window.showCellEditModal) {
      window.showCellEditModal(String(employeeId), employee.adSoyad, day, formattedDate);
    } else {
      console.error('showCellEditModal fonksiyonu bulunamadı.');

      // Modal manuel olarak açılmaya çalışılıyor
      const modal = document.getElementById('cell-edit-modal');
      if (modal) {
        console.log('Modal manuel olarak açılıyor');
        modal.classList.remove('hidden');

        // Modal içindeki bazı bilgileri manuel güncelle
        const titleElement = document.getElementById('cell-edit-title');
        if (titleElement) {
          titleElement.textContent = `${employee.adSoyad} - ${formattedDate}`;
        }
      } else {
        alert('Vardiya düzenleme modalı yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.');
      }
    }
  };

  // handleCellClick fonksiyonunu göncelleyelim (var olan fonksiyonu kullanacağız veya oluşturacağız)
  const handleCellClick = (employeeId: number | string, day: number) => {
    openShiftModal({
      employeeId,
      day,
      month: selectedMonth,
      year: selectedYear,
    });
  };

  return (
    <div className="w-full overflow-auto shadow-lg rounded-lg bg-white schedule-table-container">
      <table id="schedule-table" className="min-w-full divide-y divide-gray-200 border-collapse">
        <thead className="bg-gradient-to-r from-blue-50 to-gray-50">
          <tr>
            {/* İlk sütun - Çalışan adı için */}
            <th
              className="sticky left-0 z-10 py-3 px-4 border-b border-r text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gradient-to-r from-blue-100 to-blue-50"
              style={{ minWidth: '180px' }}
            >
              Çalışan
            </th>

            {daysInMonth.map((day) => (
              <th
                key={day}
                className={`py-2 px-3 border-b border-r text-center text-xs font-medium text-gray-700 uppercase tracking-wider ${
                  ['Cmt', 'Paz'].includes(weekDays[day - 1])
                    ? 'bg-gradient-to-b from-yellow-50 to-yellow-100'
                    : 'bg-gradient-to-b from-gray-50 to-gray-100'
                }`}
              >
                <div className="font-semibold">{day}</div>
                <div className="text-[10px] text-gray-500">{weekDays[day - 1]}</div>
              </th>
            ))}

            {/* İstatistik bilgileri için başlıklar */}
            <th className="py-2 px-2 border-b border-r text-center text-xs font-medium text-gray-700 uppercase tracking-wider bg-gradient-to-b from-blue-50 to-blue-100">
              <div className="font-semibold">Çalışma</div>
              <div className="text-[10px] text-gray-500">Gün</div>
            </th>
            <th className="py-2 px-2 border-b border-r text-center text-xs font-medium text-gray-700 uppercase tracking-wider bg-gradient-to-b from-blue-50 to-blue-100">
              <div className="font-semibold">Toplam</div>
              <div className="text-[10px] text-gray-500">Saat</div>
            </th>

            {/* Vardiya tipleri için otomatik başlıklar */}
            {shiftTypes
              .filter(
                (shift) =>
                  shift.code !== 'HT' && !['YI', 'UI', 'R', 'MZ', 'RT'].includes(shift.code),
              )
              .sort((a, b) => a.code.localeCompare(b.code))
              .map((shift) => {
                // Tablodaki başlıklar için renk stilini getir
                const colorStyle = getShiftColorStyle(shift.color, 'tableSummary');

                return (
                  <th
                    key={shift.code}
                    className="py-2 px-2 text-center text-xs font-medium text-gray-700 uppercase"
                    // style={{
                    //   background: `linear-gradient(to bottom, ${hexToRgba(
                    //     colorStyle.color,
                    //     0.05,
                    //   )}, ${hexToRgba(colorStyle.color, 0.15)})`,
                    // }}
                  >
                    <div className="font-semibold" style={{ color: colorStyle.color }}>
                      {shift.code}
                    </div>
                    <div className="text-[10px] text-gray-500">Gün/Saat</div>
                  </th>
                );
              })}

            {/* Hafta tatili başlığı */}
            <th className="py-2 px-2 border-b border-r text-center text-xs font-medium text-gray-700 uppercase tracking-wider bg-gradient-to-b from-yellow-50 to-yellow-100">
              <div className="font-semibold">HT</div>
              <div className="text-[10px] text-gray-500">Gün</div>
            </th>

            {/* İzin başlıkları */}
            {['YI', 'UI', 'R', 'MZ', 'RT'].some((code) =>
              employees.some((emp) => schedule[emp.id]?.some((shift) => shift === code)),
            ) && (
              <th className="py-2 px-2 border-b border-r text-center text-xs font-medium text-gray-700 uppercase tracking-wider bg-gradient-to-b from-green-50 to-green-100">
                <div className="font-semibold">İzin/Rapor</div>
                <div className="text-[10px] text-gray-500">Gün</div>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee, index) => {
            // Çalışanın vardiya istatistiklerini hesapla
            const stats = calculateEmployeeStats(employee.id);

            // İzin günleri
            const leaveStats = Object.entries(stats.shiftCounts)
              .filter(([code]) => ['YI', 'UI', 'R', 'MZ', 'RT'].includes(code))
              .reduce((sum, [_, count]) => sum + count, 0);

            return (
              <tr
                key={employee.id}
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {/* Çalışan bilgisi - sabit sol sütun */}
                <td
                  className="sticky left-0 z-10 py-2 px-4 border-b border-r whitespace-nowrap bg-white shadow-sm"
                  style={{
                    minWidth: '180px',
                    background: index % 2 === 0 ? 'white' : 'rgba(249, 250, 251, 0.9)',
                  }}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold">
                        {employee.adSoyad.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{employee.adSoyad}</div>
                      <div className="text-xs text-gray-500">{employee.tcNo}</div>
                    </div>
                  </div>
                </td>
                {daysInMonth.map((day) => {
                  const cellValue = schedule[employee.id]?.[day] || null;
                  const { content, className, style, tooltip } = getFormattedCellValue(
                    cellValue || '',
                  );

                  return (
                    <td
                      key={`${employee.id}-${day}`}
                      className={`relative border text-center transition-all duration-150 ${
                        cellValue === 'HT' ? 'bg-red-50' : ''
                      }`}
                      onClick={() => handleCellClick(employee.id, day)}
                      style={{
                        minWidth: '40px',
                        height: '40px',
                        cursor: 'pointer',
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center hover:bg-opacity-20 hover:bg-blue-100 transition-all duration-200">
                        {/* Vardiya değeri varsa göster */}
                        {cellValue && (
                          <div
                            className={`rounded-md w-9 h-9 flex items-center justify-center transition-transform hover:scale-105 ${
                              cellValue === 'HT' ? 'bg-yellow-100' : ''
                            }`}
                            style={{
                              backgroundColor: style?.backgroundColor || '',
                              color: style?.color || '',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                              fontWeight: 500,
                              borderRadius: '0.5rem',
                            }}
                          >
                            {content}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}

                {/* Toplam çalışma günü */}
                <td className="py-2 px-2 border-b border-r text-center text-xs font-medium bg-gradient-to-b from-blue-50 to-blue-100">
                  <div className="text-blue-700 font-bold text-sm ">{stats.totalWorkDays}</div>
                </td>

                {/* Toplam çalışma saati */}
                <td className="py-2 px-2 border-b border-r text-center text-xs font-medium bg-gradient-to-b from-blue-50 to-blue-100">
                  <div className="text-blue-700 font-bold text-sm ">
                    {stats.totalWorkHours.toFixed(1)}
                  </div>
                </td>

                {/* Her vardiya tipi için sayı/saat bilgisi */}
                {shiftTypes
                  .filter(
                    (shift) =>
                      shift.code !== 'HT' && !['YI', 'UI', 'R', 'MZ', 'RT'].includes(shift.code),
                  )
                  .sort((a, b) => a.code.localeCompare(b.code))
                  .map((shift) => {
                    const count = stats.shiftCounts[shift.code] || 0;
                    const hours = stats.shiftHours[shift.code] || 0;

                    // Tablo özeti için renk stilini getir
                    const colorStyle = getShiftColorStyle(shift.color, 'tableSummary');

                    return (
                      <td
                        key={`${employee.id}-${shift.code}`}
                        className="py-2 px-2 border-b border-r text-center text-xs font-medium"
                        style={{
                          background: `linear-gradient(to bottom, ${hexToRgba(
                            colorStyle.color,
                            0.05,
                          )}, ${hexToRgba(colorStyle.color, 0.15)})`,
                        }}
                      >
                        <div className="" style={{ color: colorStyle.color, fontWeight: 'bold' }}>
                          {count}
                          {count > 0 && (
                            <span className="text-[10px] text-gray-500 ml-1">
                              ({hours.toFixed(1)})
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}

                {/* Hafta tatili günleri */}
                <td className="py-2 px-2 border-b border-r text-center text-xs font-medium bg-gradient-to-b from-yellow-50 to-yellow-100">
                  <div className="text-yellow-700 font-bold text-sm ">
                    {stats.shiftCounts['HT'] || 0}
                  </div>
                </td>

                {/* İzin günleri */}
                {['YI', 'UI', 'R', 'MZ', 'RT'].some((code) =>
                  employees.some((emp) => schedule[emp.id]?.some((shift) => shift === code)),
                ) && (
                  <td className="py-2 px-2 border-b border-r text-center text-xs font-medium bg-gradient-to-b from-green-50 to-green-100">
                    <div className="text-green-700 font-bold text-sm ">{leaveStats}</div>
                    <div className="text-[9px] space-x-1 mt-1">
                      {Object.entries(stats.shiftCounts)
                        .filter(([code]) => ['YI', 'UI', 'R', 'MZ', 'RT'].includes(code))
                        .filter(([_, count]) => count > 0)
                        .map(([code, count]) => (
                          <span
                            key={`${employee.id}-${code}`}
                            className="inline-block px-1 py-0.5 bg-white rounded-md shadow-sm text-green-700 mr-1 mb-1"
                          >
                            {code}:{count}
                          </span>
                        ))}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
