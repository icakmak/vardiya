'use client';

import { useEffect, useState } from 'react';
import { useSchedule } from '@/app/context/ScheduleContext';

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

  // Vardiya veya izin koduna göre hücre içeriği ve stilini belirle
  const getCellContent = (cellValue: string | null) => {
    if (!cellValue) return { content: '', className: '' };

    // İzin kodları için
    if (['YI', 'UI', 'R', 'MZ', 'RT'].includes(cellValue)) {
      let className = 'bg-green-100 text-green-800 font-bold';
      if (cellValue === 'UI') className = 'bg-red-100 text-red-800 font-bold';

      return {
        content: cellValue,
        className,
      };
    }

    // Hafta tatili ise
    if (cellValue === 'HT') {
      return {
        content: 'HT',
        className: 'bg-yellow-100 text-yellow-800 font-bold',
      };
    }

    // Vardiya kodu ise
    const shift = shiftTypes.find((s) => s.code === cellValue);
    if (shift) {
      return {
        content: shift.code,
        className: `bg-${shift.color}-100 text-${shift.color}-800 font-bold`,
      };
    }

    return { content: cellValue, className: '' };
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
        } else {
          // Varsayılan olarak 8 saat
          hours = 8;
        }

        stats.shiftHours[shift.code] += hours;
        stats.totalWorkHours += hours;
      }
    });

    return stats;
  };

  return (
    <div className="overflow-x-auto schedule-table-container">
      <table
        className="min-w-full text-sm bg-white border border-gray-200 rounded shadow-sm"
        id="schedule-table"
      >
        <thead>
          <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
            <th className="py-2 px-3 border-b border-r text-left text-xs font-medium text-gray-600 uppercase tracking-wider sticky left-0 bg-white">
              Sicil No
            </th>
            <th className="py-2 px-3 border-b border-r text-left text-xs font-medium text-gray-600 uppercase tracking-wider sticky left-[81px] bg-white">
              Ad Soyad
            </th>
            {daysInMonth.map((day) => (
              <th
                key={day}
                className={`py-2 px-3 border-b border-r text-center text-xs font-medium text-gray-600 uppercase tracking-wider ${
                  ['Cmt', 'Paz'].includes(weekDays[day - 1]) ? 'bg-yellow-50' : ''
                }`}
              >
                <div>{day}</div>
                <div className="text-[10px] text-gray-500">{weekDays[day - 1]}</div>
              </th>
            ))}

            {/* İstatistik bilgileri için başlıklar */}
            <th className="py-2 px-2 border-b border-r text-center text-xs font-medium text-gray-600 uppercase tracking-wider bg-blue-50">
              <div>Çalışma</div>
              <div className="text-[10px] text-gray-500">Gün</div>
            </th>
            <th className="py-2 px-2 border-b border-r text-center text-xs font-medium text-gray-600 uppercase tracking-wider bg-blue-50">
              <div>Toplam</div>
              <div className="text-[10px] text-gray-500">Saat</div>
            </th>

            {/* Vardiya tipleri için otomatik başlıklar */}
            {shiftTypes
              .filter(
                (shift) =>
                  shift.code !== 'HT' && !['YI', 'UI', 'R', 'MZ', 'RT'].includes(shift.code),
              )
              .sort((a, b) => a.code.localeCompare(b.code))
              .map((shift) => (
                <th
                  key={shift.code}
                  className={`py-2 px-2 border-b border-r text-center text-xs font-medium text-gray-600 uppercase tracking-wider bg-${
                    shift.color || 'gray'
                  }-50`}
                >
                  <div>{shift.code}</div>
                  <div className="text-[10px] text-gray-500">Gün/Saat</div>
                </th>
              ))}

            {/* Hafta tatili başlığı */}
            <th className="py-2 px-2 border-b border-r text-center text-xs font-medium text-gray-600 uppercase tracking-wider bg-yellow-50">
              <div>HT</div>
              <div className="text-[10px] text-gray-500">Gün</div>
            </th>

            {/* İzin başlıkları */}
            {['YI', 'UI', 'R', 'MZ', 'RT'].some((code) =>
              employees.some((emp) => schedule[emp.id]?.some((shift) => shift === code)),
            ) && (
              <th className="py-2 px-2 border-b border-r text-center text-xs font-medium text-gray-600 uppercase tracking-wider bg-green-50">
                <div>İzin/Rapor</div>
                <div className="text-[10px] text-gray-500">Gün</div>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => {
            // Çalışanın vardiya istatistiklerini hesapla
            const stats = calculateEmployeeStats(employee.id);

            // İzin günleri
            const leaveStats = Object.entries(stats.shiftCounts)
              .filter(([code]) => ['YI', 'UI', 'R', 'MZ', 'RT'].includes(code))
              .reduce((sum, [_, count]) => sum + count, 0);

            return (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="py-2 px-3 border-b border-r text-xs sticky left-0 bg-white">
                  {employee.tcNo}
                </td>
                <td className="py-2 px-3 border-b border-r text-xs font-medium sticky left-[81px] bg-white">
                  {employee.adSoyad}
                </td>
                {daysInMonth.map((day) => {
                  const cellValue = schedule[employee.id]?.[day] || null;
                  const { content, className } = getCellContent(cellValue);

                  return (
                    <td
                      key={`${employee.id}-${day}`}
                      className={`py-2 px-1 border-b border-r text-center text-xs cursor-pointer hover:bg-gray-100 transition-colors ${
                        ['Cmt', 'Paz'].includes(weekDays[day - 1]) ? 'bg-yellow-50' : ''
                      }`}
                      data-employee-id={employee.id}
                      data-day={day}
                      title={`${employee.adSoyad} - ${day} ${
                        [
                          'Ocak',
                          'Şubat',
                          'Mart',
                          'Nisan',
                          'Mayıs',
                          'Haziran',
                          'Temmuz',
                          'Ağustos',
                          'Eylül',
                          'Ekim',
                          'Kasım',
                          'Aralık',
                        ][selectedMonth - 1]
                      } ${selectedYear} - ${weekDays[day - 1]}`}
                    >
                      {content ? (
                        <div
                          className={`w-8 h-8 mx-auto flex items-center justify-center ${className} rounded-md shadow-sm hover:shadow transition-all`}
                        >
                          {content}
                        </div>
                      ) : (
                        <div className="w-8 h-8 mx-auto flex items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600 transition-all">
                          +
                        </div>
                      )}
                    </td>
                  );
                })}

                {/* Toplam çalışma günü */}
                <td className="py-2 px-2 border-b border-r text-center text-xs font-medium bg-blue-50">
                  <div className="text-blue-700 font-bold">{stats.totalWorkDays}</div>
                </td>

                {/* Toplam çalışma saati */}
                <td className="py-2 px-2 border-b border-r text-center text-xs font-medium bg-blue-50">
                  <div className="text-blue-700 font-bold">{stats.totalWorkHours.toFixed(1)}</div>
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

                    return (
                      <td
                        key={`${employee.id}-${shift.code}`}
                        className={`py-2 px-2 border-b border-r text-center text-xs font-medium bg-${
                          shift.color || 'gray'
                        }-50`}
                      >
                        <div className={`text-${shift.color || 'gray'}-700 font-bold`}>
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
                <td className="py-2 px-2 border-b border-r text-center text-xs font-medium bg-yellow-50">
                  <div className="text-yellow-700 font-bold">{stats.shiftCounts['HT'] || 0}</div>
                </td>

                {/* İzin günleri */}
                {['YI', 'UI', 'R', 'MZ', 'RT'].some((code) =>
                  employees.some((emp) => schedule[emp.id]?.some((shift) => shift === code)),
                ) && (
                  <td className="py-2 px-2 border-b border-r text-center text-xs font-medium bg-green-50">
                    <div className="text-green-700 font-bold">{leaveStats}</div>
                    <div className="text-[10px] space-x-1">
                      {Object.entries(stats.shiftCounts)
                        .filter(([code]) => ['YI', 'UI', 'R', 'MZ', 'RT'].includes(code))
                        .filter(([_, count]) => count > 0)
                        .map(([code, count]) => (
                          <span key={`${employee.id}-${code}`} className="whitespace-nowrap">
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
