'use client';

import { useSchedule, ShiftType } from '@/app/context/ScheduleContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// SVG desteği için gerekli
import 'svg2pdf.js';

// Türkçe karakter sorunu için declare module
declare module 'jspdf' {
  interface jsPDF {
    setLanguage(lang: string): jsPDF;
  }
}

export default function ExcelExport() {
  const { employees, schedule, shiftTypes, selectedMonth, selectedYear } = useSchedule();

  // PDF'e aktarma fonksiyonu
  const exportToPDF = () => {
    try {
      if (!employees.length || !Object.keys(schedule).length) {
        alert('Aktarılacak çizelge verileri bulunamadı!');
        return;
      }

      // Ay ve yıl bilgisini hazırla
      const monthNames = [
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
      ];
      const monthName = monthNames[selectedMonth - 1];

      // Ekran PDF dönüşümü için DOM öğesini bul
      const scheduleTable = document.querySelector('#schedule-table');
      if (!scheduleTable) {
        alert('Çizelge tablosu bulunamadı, lütfen önce çizelgeyi oluşturun!');
        return;
      }

      // Çizelge tablosunun bulunduğu container'ı bul
      const tableContainer = document.querySelector('.schedule-table-container');
      if (tableContainer) {
        // PDF oluşturmadan önce scroll konumunu en sola getir
        (tableContainer as HTMLElement).scrollLeft = 0;
        console.log('Çizelge scroll konumu PDF için sıfırlandı');
      }

      // PDF dönüşümü için loading göster
      const loadingDiv = document.createElement('div');
      loadingDiv.innerHTML =
        '<div class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50"><div class="bg-white p-4 rounded-lg"><p class="text-lg font-bold">PDF oluşturuluyor...</p></div></div>';
      document.body.appendChild(loadingDiv);

      // Çizelgeyi PDF'e dönüştür
      html2canvas(scheduleTable as HTMLElement, {
        scale: 1.5, // Daha net görüntü için ölçeklendirme
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');

        // PDF oluştur
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
        });

        // PDF başlığı - ASCII karakterlerle
        pdf.setFontSize(16);
        pdf.text(`${monthName} ${selectedYear} Vardiya Cizelgesi`, 15, 15);

        // Çizelge resmini ekle
        const imgWidth = 280;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight);

        // İkinci sayfa için vardiya tiplerini ekle
        pdf.addPage();

        // Başlık
        pdf.setFillColor(240, 240, 240);
        pdf.rect(10, 10, 280, 10, 'F');
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Vardiya ve Izin Tipleri', 15, 17);

        // 1. Çalışma Vardiyaları
        pdf.setFontSize(12);
        pdf.text('1. Calisma Vardiyalari', 15, 30);

        // Vardiya tipleri - çalışma
        const workShiftTypes = shiftTypes.filter(
          (shift) => !['HT', 'YI', 'UI', 'R', 'MZ', 'RT'].includes(shift.code),
        );

        let yPos = 40;
        workShiftTypes.forEach((shift) => {
          // Vardiya rengini ayarla
          const textColor = shift.color ? convertColorToRGB(shift.color) : { r: 0, g: 0, b: 0 };
          pdf.setFillColor(textColor.r, textColor.g, textColor.b);
          pdf.rect(15, yPos - 4, 5, 5, 'F');

          // Vardiya bilgisi
          pdf.setTextColor(0, 0, 0);
          const vardiyaText = `${shift.code}: ${shift.name
            .replace(/ü/g, 'u')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ş/g, 's')
            .replace(/ç/g, 'c')
            .replace(/ğ/g, 'g')} ${
            shift.startTime && shift.endTime ? `(${shift.startTime}-${shift.endTime})` : ''
          }`;
          pdf.text(vardiyaText, 25, yPos);

          yPos += 8;
        });

        // 2. İzin ve Tatil Tipleri
        yPos += 5;
        pdf.text('2. Izin ve Tatil Tipleri', 15, yPos);
        yPos += 10;

        // Tablo başlıkları
        pdf.setFillColor(240, 240, 240);
        pdf.rect(15, yPos, 15, 8, 'F'); // Kod başlığı
        pdf.rect(30, yPos, 60, 8, 'F'); // Açıklama başlığı
        pdf.rect(90, yPos, 160, 8, 'F'); // Detay başlığı

        pdf.text('Kod', 17, yPos + 5);
        pdf.text('Aciklama', 35, yPos + 5);
        pdf.text('Detay', 95, yPos + 5);

        yPos += 8;

        // İzin tipleri
        const leaveTypes = [
          {
            code: 'HT',
            name: 'Hafta Tatili',
            detail: 'Calisanin haftalik izin gunu',
            color: '#E0E0E0', // Gri (resimde gösterildiği gibi)
          },
          {
            code: 'YI',
            name: 'Yillik Izin',
            detail: 'Calisanin yillik ucretli izin gunu',
            color: '#CCFFCC', // Açık yeşil (resimde gösterildiği gibi)
          },
          {
            code: 'UI',
            name: 'Ucretsiz Izin',
            detail: 'Calisanin ucret almadan kullandigi izin gunu',
            color: '#FFCCCC', // Açık pembe (resimde gösterildiği gibi)
          },
          {
            code: 'R',
            name: 'Rapor/Istirahat',
            detail: 'Saglik durumu nedeniyle kullanilan izin',
            color: '#CCFFFF', // Açık mavi (resimde gösterildiği gibi)
          },
          {
            code: 'MZ',
            name: 'Mazeret Izni',
            detail: 'Evlilik, dogum, olum vb. ozel durumlarda kullanilan izin',
            color: '#CCFFCC', // Açık yeşil-mavi (resimde gösterildiği gibi)
          },
          {
            code: 'RT',
            name: 'Resmi Tatil',
            detail: 'Resmi ve dini bayram tatilleri',
            color: '#CCFFCC', // Açık yeşil (resimde gösterildiği gibi)
          },
        ];

        leaveTypes.forEach((type) => {
          // Kod hücresi rengi
          const typeColor = type.color ? convertColorToRGB(type.color) : { r: 220, g: 50, b: 50 };
          pdf.setFillColor(typeColor.r, typeColor.g, typeColor.b);
          pdf.rect(15, yPos, 15, 8, 'F');

          // Kod metni - siyah yazı çünkü arka plan açık renk
          pdf.setTextColor(0, 0, 0);
          pdf.text(type.code, 17, yPos + 5);

          // Açıklama ve detay (beyaz arka plan)
          pdf.setFillColor(255, 255, 255);
          pdf.rect(30, yPos, 60, 8, 'F');
          pdf.rect(90, yPos, 160, 8, 'F');

          // Açıklama ve detay metni
          pdf.text(type.name, 35, yPos + 5);
          pdf.text(type.detail, 95, yPos + 5);

          // Çerçeve
          pdf.setDrawColor(150, 150, 150);
          pdf.rect(15, yPos, 15, 8, 'D');
          pdf.rect(30, yPos, 60, 8, 'D');
          pdf.rect(90, yPos, 160, 8, 'D');

          yPos += 8;
        });

        // Vardiya Tipi Renk Gösterimi
        yPos += 10;
        pdf.text('Vardiya Tipi Renk Gosterimi', 15, yPos);
        yPos += 10;

        // A ve B vardiyaları için renkli gösterim
        const renkTipleri = [
          { code: 'A', desc: 'Gunduz (08:00-20:00)', color: 'blue' },
          { code: 'B', desc: 'Gece (20:00-08:00)', color: 'purple' },
        ];

        renkTipleri.forEach((renk) => {
          const textColor = convertColorToRGB(renk.color);
          pdf.setFillColor(textColor.r, textColor.g, textColor.b);
          pdf.rect(15, yPos - 4, 5, 5, 'F');

          pdf.setTextColor(0, 0, 0);
          pdf.text(`${renk.code}: ${renk.desc}`, 25, yPos);

          yPos += 8;
        });

        // PDF'i indir
        pdf.save(`Vardiya_Cizelgesi_${monthName}_${selectedYear}.pdf`);

        // Loading'i kaldır
        document.body.removeChild(loadingDiv);
      });
    } catch (error) {
      console.error('PDF dışa aktarma hatası:', error);
      alert('PDF dosyasına aktarma sırasında bir hata oluştu!');
    }
  };

  // Excel'e aktarma fonksiyonu
  const exportToExcel = () => {
    try {
      if (!employees.length || !Object.keys(schedule).length) {
        alert('Aktarılacak çizelge verileri bulunamadı!');
        return;
      }

      // Çizelge tablosunun bulunduğu container'ı bul
      const tableContainer = document.querySelector('.schedule-table-container');
      if (tableContainer) {
        // Excel oluşturmadan önce scroll konumunu en sola getir
        (tableContainer as HTMLElement).scrollLeft = 0;
        console.log('Çizelge scroll konumu Excel için sıfırlandı');
      }

      // Ay ve yıl bilgisini hazırla
      const monthNames = [
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
      ];
      const monthName = monthNames[selectedMonth - 1];

      // Seçilen ay için gün sayısı
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

      // Her gün için haftanın günü bilgisini hazırla
      const weekDayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      const weekDays = Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(selectedYear, selectedMonth - 1, i + 1);
        return weekDayNames[date.getDay()];
      });

      // Excel verilerini hazırla
      const workbook = XLSX.utils.book_new();

      // 1. Çizelge Sayfası
      const worksheetData = [];

      // Başlık satırı
      const headerRow = ['Sicil No', 'Ad Soyad'];

      // Günler için başlıklar
      for (let day = 1; day <= daysInMonth; day++) {
        headerRow.push(`${day}\n${weekDays[day - 1]}`);
      }

      // İstatistik sütunları
      headerRow.push('Çalışma (Gün)', 'Toplam (Saat)');

      // Vardiya tipleri
      const workShiftTypes = shiftTypes
        .filter(
          (shift) => shift.code !== 'HT' && !['YI', 'UI', 'R', 'MZ', 'RT'].includes(shift.code),
        )
        .sort((a, b) => a.code.localeCompare(b.code));

      workShiftTypes.forEach((shift) => {
        headerRow.push(`${shift.code} (Gün/Saat)`);
      });

      // Hafta tatili ve izin sütunları
      headerRow.push('HT (Gün)');

      // İzinler için tek sütun
      if (
        ['YI', 'UI', 'R', 'MZ', 'RT'].some((code) =>
          employees.some((emp) => schedule[emp.id]?.some((shift) => shift === code)),
        )
      ) {
        headerRow.push('İzin/Rapor (Gün)');
      }

      worksheetData.push(headerRow);

      // Çalışan verileri
      employees.forEach((employee) => {
        const row = [employee.tcNo, employee.adSoyad];

        // Vardiya günleri
        for (let day = 1; day <= daysInMonth; day++) {
          row.push(schedule[employee.id]?.[day] || '');
        }

        // İstatistik hesapla
        const stats = calculateEmployeeStats(employee.id);

        // Toplam çalışma günü ve saati - tip dönüşümü ile
        row.push(stats.totalWorkDays.toString());
        row.push(stats.totalWorkHours.toFixed(1));

        // Her vardiya tipi için detaylar
        workShiftTypes.forEach((shift) => {
          const count = stats.shiftCounts[shift.code] || 0;
          const hours = stats.shiftHours[shift.code] || 0;
          row.push(`${count} (${hours.toFixed(1)})`);
        });

        // Hafta tatili
        row.push((stats.shiftCounts['HT'] || 0).toString());

        // İzin günleri
        if (
          ['YI', 'UI', 'R', 'MZ', 'RT'].some((code) =>
            employees.some((emp) => schedule[emp.id]?.some((shift) => shift === code)),
          )
        ) {
          const leaveDetails = Object.entries(stats.shiftCounts)
            .filter(([code]) => ['YI', 'UI', 'R', 'MZ', 'RT'].includes(code))
            .filter(([_, count]) => count > 0)
            .map(([code, count]) => `${code}:${count}`)
            .join(', ');

          const leaveTotal = Object.entries(stats.shiftCounts)
            .filter(([code]) => ['YI', 'UI', 'R', 'MZ', 'RT'].includes(code))
            .reduce((sum, [_, count]) => sum + count, 0);

          row.push(`${leaveTotal} (${leaveDetails})`);
        }

        worksheetData.push(row);
      });

      // Çizelge sayfasını oluştur
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Sütun genişliklerini ayarla
      const columnWidths = [
        { wch: 15 }, // Sicil No
        { wch: 25 }, // Ad Soyad
      ];

      // Günler için sütun genişliği
      for (let i = 0; i < daysInMonth; i++) {
        columnWidths.push({ wch: 6 });
      }

      // İstatistikler için sütun genişliği
      for (let i = 0; i < 2 + workShiftTypes.length + 2; i++) {
        columnWidths.push({ wch: 15 });
      }

      worksheet['!cols'] = columnWidths;

      // Sayfayı ekle
      XLSX.utils.book_append_sheet(workbook, worksheet, `${monthName} ${selectedYear} Vardiya`);

      // 2. Vardiya Tipleri Sayfası
      const shiftTypesData = createShiftTypesWorksheet(monthNames);
      const shiftTypesWorksheet = XLSX.utils.aoa_to_sheet(shiftTypesData);

      // Vardiya tipleri sayfası için sütun genişlikleri
      const shiftTypesColWidths = [
        { wch: 10 }, // Kod
        { wch: 25 }, // Vardiya Adı
        { wch: 15 }, // Başlangıç Saati
        { wch: 15 }, // Bitiş Saati
        { wch: 15 }, // Vardiya Süresi (Saat)
      ];

      shiftTypesWorksheet['!cols'] = shiftTypesColWidths;

      XLSX.utils.book_append_sheet(workbook, shiftTypesWorksheet, 'Vardiya Tipleri');

      // Excel dosyasını kaydet
      XLSX.writeFile(workbook, `Vardiya_Çizelgesi_${monthName}_${selectedYear}.xlsx`);
    } catch (error) {
      console.error('Excel dışa aktarma hatası:', error);
      alert('Excel dosyasına aktarma sırasında bir hata oluştu!');
    }
  };

  // Vardiya tipleri sayfası verilerini oluştur - sadeleştirilmiş - linter hatası düzeltildi
  const createShiftTypesWorksheet = (monthNames: string[]) => {
    const shiftTypesData = [];

    // Başlık satırı
    shiftTypesData.push([
      'VARDİYA TİPLERİ VE ÇALIŞMA SAATLERİ',
      `${monthNames[selectedMonth - 1].toUpperCase()} ${selectedYear}`,
    ]);
    shiftTypesData.push([]);

    // Tablo başlıkları
    shiftTypesData.push([
      'Kod',
      'Vardiya Adı',
      'Başlangıç Saati',
      'Bitiş Saati',
      'Vardiya Süresi (Saat)',
    ]);

    // Her vardiya tipi için satır ekle
    shiftTypes.forEach((shift) => {
      // Vardiya süresini hesapla
      let duration = '';

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
        const hours = hourDiff + minuteDiff / 60;
        duration = hours.toFixed(1);
      } else if (['HT', 'YI', 'UI', 'R', 'MZ', 'RT'].includes(shift.code)) {
        // İzin türleri için özel değer
        duration = '-';
      } else {
        // Varsayılan olarak 8 saat
        duration = '8.0';
      }

      // Vardiya tipinin açıklamasını ekle
      let description = shift.name;
      if (['HT', 'YI', 'UI', 'R', 'MZ', 'RT'].includes(shift.code)) {
        switch (shift.code) {
          case 'HT':
            description = 'Hafta Tatili';
            break;
          case 'YI':
            description = 'Yıllık İzin';
            break;
          case 'UI':
            description = 'Ücretsiz İzin';
            break;
          case 'R':
            description = 'Rapor/İstirahat';
            break;
          case 'MZ':
            description = 'Mazeret İzni';
            break;
          case 'RT':
            description = 'Resmi Tatil';
            break;
        }
      }

      shiftTypesData.push([
        shift.code,
        description,
        shift.startTime || '-',
        shift.endTime || '-',
        duration,
      ]);
    });

    // Açıklama bölümü
    shiftTypesData.push([]);
    shiftTypesData.push([
      'Not:',
      'Bu sayfada tanımlı tüm vardiya tipleri ve çalışma saatleri listelenmektedir.',
    ]);
    shiftTypesData.push(['', 'İzin ve tatil günleri için süre belirtilmemiştir.']);

    return shiftTypesData;
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

  // Renk kodunu RGB değerlerine dönüştür (PDF için)
  const convertColorToRGB = (color: string) => {
    let hexColor = color;

    // Renk isimlerini HEX formatına dönüştür
    if (!color.startsWith('#')) {
      const colorMap: { [key: string]: string } = {
        blue: '#0000FF',
        red: '#FF0000',
        green: '#008000',
        yellow: '#FFFF00',
        purple: '#800080',
        orange: '#FFA500',
        pink: '#FFC0CB',
        gray: '#808080',
        indigo: '#4B0082',
        brown: '#A52A2A',
        black: '#000000',
        white: '#FFFFFF',
        cyan: '#00FFFF',
        magenta: '#FF00FF',
      };

      hexColor = colorMap[color.toLowerCase()] || '#808080';
    }

    // Hex değerini RGB'ye dönüştür
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    return { r, g, b };
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={exportToExcel}
        className="flex items-center justify-center bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        <i className="fas fa-file-excel mr-2"></i> Excel'e Aktar
      </button>
      <button
        onClick={exportToPDF}
        className="flex items-center justify-center bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
      >
        <i className="fas fa-file-pdf mr-2"></i> PDF'e Aktar
      </button>
    </div>
  );
}
