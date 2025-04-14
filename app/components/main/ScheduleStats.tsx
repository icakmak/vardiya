'use client';

import { useSchedule } from '@/app/context/ScheduleContext';
import { useState, useEffect, useMemo } from 'react';

export default function ScheduleStats() {
  const { employees, schedule, shiftTypes, selectedMonth, selectedYear, shiftCounts } =
    useSchedule();

  // Personel raporu için filtre state'leri
  const [filterShiftType, setFilterShiftType] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('totalShifts');
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);

  // Aktif çalışan sayısı
  const activeEmployeeCount = employees.filter((emp) => emp.isActive !== false).length;

  // Ayın gün sayısını hesapla
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  // Hafta içi/sonu günleri hesapla
  const weekdayCount = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(selectedYear, selectedMonth - 1, i + 1);
    const dayOfWeek = date.getDay(); // 0: Pazar, 6: Cumartesi
    return dayOfWeek !== 0 && dayOfWeek !== 6; // Hafta içi ise true
  }).filter(Boolean).length;

  const weekendCount = daysInMonth - weekdayCount;

  // Toplam çalışma günü = Mesai takvimindeki iş günleri (hafta içi günler)
  const totalWorkDays = weekdayCount;

  // Toplam hafta tatili günü = Mesai takvimindeki hafta sonu (tatil) günleri
  const totalWeekendDays = weekendCount;

  // Bir vardiya için ortalama saat hesabı
  const averageShiftHours = useMemo(() => {
    // Vardiya tipleri içinden geçerli vardiyaları (çalışma vardiyalarını) filtrele
    const workShiftTypes = shiftTypes.filter(
      (shift) =>
        !['HT', 'YI', 'UI', 'R', 'MZ', 'RT'].includes(shift.code) &&
        shift.startTime &&
        shift.endTime,
    );

    if (workShiftTypes.length === 0) return 8; // Eğer vardiya yoksa varsayılan 8 saat

    // Her vardiya için süreyi hesapla
    const shiftHours = workShiftTypes.map((shift) => {
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
      return hourDiff + minuteDiff / 60;
    });

    // Tüm vardiya sürelerinin ortalamasını al
    return shiftHours.reduce((total, hours) => total + hours, 0) / shiftHours.length;
  }, [shiftTypes]);

  // Toplam çalışma saati = Toplam çalışma günü × Ortalama vardiya saati
  const totalWorkHours = weekdayCount * averageShiftHours;

  // Tarih formatını ayarla
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
  const displayDate = `${monthNames[selectedMonth - 1]} ${selectedYear}`;

  // Personelin toplam çalışma adam/günü
  const totalManDays = activeEmployeeCount * weekdayCount;

  // Personelin toplam çalışma adam/saati
  const totalManHours = totalManDays * averageShiftHours;

  // Personelin toplam hafta tatili adam/günü
  const totalManWeekendDays = activeEmployeeCount * weekendCount;

  // Vardiya tipi dağılımını hesapla
  const calculateShiftTypeDistribution = () => {
    const shiftTypeCount: Record<string, number> = {};
    const shiftTypeHours: Record<string, number> = {};

    // Toplam vardiya sayısı ve saatleri
    let totalShifts = 0;
    let totalHours = 0;

    // Her vardiya tipi için toplam vardiya sayısını bul
    Object.values(schedule).forEach((employeeSchedule) => {
      if (!employeeSchedule) return;

      for (let day = 1; day <= daysInMonth; day++) {
        const shiftCode = employeeSchedule[day];

        if (shiftCode && !['HT', 'YI', 'UI', 'R', 'MZ', 'RT'].includes(shiftCode)) {
          // Vardiya tipini topla
          shiftTypeCount[shiftCode] = (shiftTypeCount[shiftCode] || 0) + 1;
          totalShifts++;

          // Vardiya saatlerini topla
          const shiftType = shiftTypes.find((s) => s.code === shiftCode);
          let hours = averageShiftHours;

          if (shiftType && shiftType.startTime && shiftType.endTime) {
            const startParts = shiftType.startTime.split(':').map(Number);
            const endParts = shiftType.endTime.split(':').map(Number);

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

          shiftTypeHours[shiftCode] = (shiftTypeHours[shiftCode] || 0) + hours;
          totalHours += hours;
        }
      }
    });

    // Yüzdelik hesapla
    const shiftTypePercentage: Record<string, number> = {};
    Object.keys(shiftTypeCount).forEach((code) => {
      shiftTypePercentage[code] = Math.round((shiftTypeCount[code] / totalShifts) * 100);
    });

    return { shiftTypeCount, shiftTypeHours, shiftTypePercentage, totalShifts, totalHours };
  };

  // İzin türü dağılımını hesapla
  const calculateLeaveDistribution = () => {
    const leaveTypeCount: Record<string, number> = {};
    let totalLeaves = 0;

    // Her izin tipi için toplam izin sayısını bul
    Object.values(schedule).forEach((employeeSchedule) => {
      if (!employeeSchedule) return;

      for (let day = 1; day <= daysInMonth; day++) {
        const shiftCode = employeeSchedule[day];

        if (shiftCode && ['HT', 'YI', 'UI', 'R', 'MZ', 'RT'].includes(shiftCode)) {
          // İzin tipini topla
          leaveTypeCount[shiftCode] = (leaveTypeCount[shiftCode] || 0) + 1;
          totalLeaves++;
        }
      }
    });

    // Yüzdelik hesapla
    const leaveTypePercentage: Record<string, number> = {};
    Object.keys(leaveTypeCount).forEach((code) => {
      leaveTypePercentage[code] = Math.round((leaveTypeCount[code] / totalLeaves) * 100);
    });

    return { leaveTypeCount, leaveTypePercentage, totalLeaves };
  };

  // İstatistikleri hesapla
  const shiftDistribution = calculateShiftTypeDistribution();
  const leaveDistribution = calculateLeaveDistribution();

  // Ortalama günlük çalışan sayısı
  const avgDailyWorkers = shiftDistribution.totalShifts / totalWorkDays;

  // Vardiya tipi kodlarını isimlere çevir
  const getShiftTypeName = (code: string) => {
    const shiftType = shiftTypes.find((s) => s.code === code);
    return shiftType ? shiftType.name : code;
  };

  // İzin kodu açıklamaları
  const leaveTypeNames: Record<string, string> = {
    HT: 'Hafta Tatili',
    YI: 'Yıllık İzin',
    UI: 'Ücretsiz İzin',
    R: 'Rapor',
    MZ: 'Mazeret İzni',
    RT: 'Resmi Tatil',
  };

  // Personel bazlı vardiya dağılımı hesaplama
  const calculatePersonnelShiftDistribution = () => {
    const personnelStats: Record<
      string,
      {
        id: string;
        name: string;
        totalShifts: number;
        totalHours: number;
        weekdayShifts: number;
        weekendShifts: number;
        leaves: Record<string, number>;
        shifts: Record<string, number>;
        efficiency: number;
        averageHoursPerShift: number;
        consecutiveShiftDays: number;
        longestStreak: number;
        shiftDistribution: number[];
        firstShiftDay: number | null;
        lastShiftDay: number | null;
      }
    > = {};

    // Her çalışan için vardiya istatistiklerini hesapla
    employees
      .filter((emp) => emp.isActive !== false)
      .forEach((employee) => {
        personnelStats[employee.id] = {
          id: employee.id,
          name: employee.adSoyad,
          totalShifts: 0,
          totalHours: 0,
          weekdayShifts: 0,
          weekendShifts: 0,
          leaves: {},
          shifts: {},
          efficiency: 0,
          averageHoursPerShift: 0,
          consecutiveShiftDays: 0,
          longestStreak: 0,
          shiftDistribution: Array(daysInMonth + 1).fill(0), // Günlere göre vardiya dağılımı
          firstShiftDay: null,
          lastShiftDay: null,
        };

        // İzin tiplerini sıfırla
        ['HT', 'YI', 'UI', 'R', 'MZ', 'RT'].forEach((code) => {
          personnelStats[employee.id].leaves[code] = 0;
        });

        // Vardiya tiplerini sıfırla
        shiftTypes.forEach((type) => {
          if (!['HT', 'YI', 'UI', 'R', 'MZ', 'RT'].includes(type.code)) {
            personnelStats[employee.id].shifts[type.code] = 0;
          }
        });

        // Çalışan çizelgesini kontrol et
        const employeeSchedule = schedule[employee.id];
        if (!employeeSchedule) return;

        // Ardışık vardiya günleri sayısını hesaplamak için değişkenler
        let currentStreak = 0;
        let maxStreak = 0;

        // Her gün için vardiya istatistiklerini güncelle
        for (let day = 1; day <= daysInMonth; day++) {
          const shiftCode = employeeSchedule[day];
          if (!shiftCode) continue;

          // Gün hafta içi mi hafta sonu mu kontrol et
          const date = new Date(selectedYear, selectedMonth - 1, day);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          if (['HT', 'YI', 'UI', 'R', 'MZ', 'RT'].includes(shiftCode)) {
            // İzin türlerini hesapla
            personnelStats[employee.id].leaves[shiftCode] =
              (personnelStats[employee.id].leaves[shiftCode] || 0) + 1;

            // İzin gününde streak sıfırlanır
            currentStreak = 0;
          } else {
            // Vardiya türlerini hesapla
            personnelStats[employee.id].shifts[shiftCode] =
              (personnelStats[employee.id].shifts[shiftCode] || 0) + 1;

            // İlk ve son vardiya günleri
            if (personnelStats[employee.id].firstShiftDay === null) {
              personnelStats[employee.id].firstShiftDay = day;
            }
            personnelStats[employee.id].lastShiftDay = day;

            // Dağılım grafiği için veri noktası ekle
            personnelStats[employee.id].shiftDistribution[day] = 1;

            // Toplam vardiya sayısını artır
            personnelStats[employee.id].totalShifts++;

            // Ardışık vardiya günlerini takip et
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);

            // Hafta içi/sonu vardiya sayısını güncelle
            if (isWeekend) {
              personnelStats[employee.id].weekendShifts++;
            } else {
              personnelStats[employee.id].weekdayShifts++;
            }

            // Vardiya saatlerini hesapla
            const shiftType = shiftTypes.find((s) => s.code === shiftCode);
            let hours = averageShiftHours;

            if (shiftType && shiftType.startTime && shiftType.endTime) {
              const startParts = shiftType.startTime.split(':').map(Number);
              const endParts = shiftType.endTime.split(':').map(Number);

              const startHour = startParts[0];
              const startMinute = startParts[1] || 0;
              const endHour = endParts[0];
              const endMinute = endParts[1] || 0;

              let hourDiff = endHour - startHour;
              let minuteDiff = endMinute - startMinute;

              if (hourDiff < 0 || (hourDiff === 0 && minuteDiff < 0)) {
                hourDiff += 24;
              }

              hours = hourDiff + minuteDiff / 60;
            }

            personnelStats[employee.id].totalHours += hours;
          }
        }

        // Ardışık vardiya günlerini kaydet
        personnelStats[employee.id].longestStreak = maxStreak;

        // Çalışma süresi ortalaması
        personnelStats[employee.id].averageHoursPerShift =
          personnelStats[employee.id].totalShifts > 0
            ? personnelStats[employee.id].totalHours / personnelStats[employee.id].totalShifts
            : 0;

        // Verimlilik hesaplama (Toplam vardiya / Olası maksimum vardiya)
        const maxPossibleShifts = weekdayCount; // Bir çalışanın alabileceği maksimum vardiya sayısı
        personnelStats[employee.id].efficiency =
          maxPossibleShifts > 0
            ? (personnelStats[employee.id].totalShifts / maxPossibleShifts) * 100
            : 0;
      });

    return personnelStats;
  };

  // Personel bazlı istatistikleri hesapla
  const personnelStats = calculatePersonnelShiftDistribution();

  // Vardiya tipleri için hesaplanan çalışma saatleri
  const shiftTypeWorkHours: Record<string, number> = {};
  shiftTypes.forEach((shift) => {
    if (!['HT', 'YI', 'UI', 'R', 'MZ', 'RT'].includes(shift.code)) {
      if (shift.startTime && shift.endTime) {
        const startParts = shift.startTime.split(':').map(Number);
        const endParts = shift.endTime.split(':').map(Number);

        const startHour = startParts[0];
        const startMinute = startParts[1] || 0;
        const endHour = endParts[0];
        const endMinute = endParts[1] || 0;

        let hourDiff = endHour - startHour;
        let minuteDiff = endMinute - startMinute;

        if (hourDiff < 0 || (hourDiff === 0 && minuteDiff < 0)) {
          hourDiff += 24;
        }

        shiftTypeWorkHours[shift.code] = hourDiff + minuteDiff / 60;
      } else {
        shiftTypeWorkHours[shift.code] = averageShiftHours;
      }
    }
  });

  // Tablo sıralama ve filtreleme
  const filteredAndSortedPersonnel = useMemo(() => {
    return Object.values(personnelStats)
      .filter((person) => {
        // Filtreleme işlemleri
        if (filterShiftType !== 'all') {
          // Belirli vardiya tipine göre filtrele
          return person.shifts[filterShiftType] > 0;
        }

        return true;
      })
      .sort((a, b) => {
        // Sıralama işlemleri
        switch (sortOption) {
          case 'totalShifts':
            return b.totalShifts - a.totalShifts;
          case 'efficiency':
            return b.efficiency - a.efficiency;
          case 'totalHours':
            return b.totalHours - a.totalHours;
          case 'name':
            return a.name.localeCompare(b.name);
          case 'weekendShifts':
            return b.weekendShifts - a.weekendShifts;
          case 'longestStreak':
            return b.longestStreak - a.longestStreak;
          default:
            return 0;
        }
      });
  }, [personnelStats, filterShiftType, sortOption]);

  // Özet istatistikler
  const summaryStats = useMemo(() => {
    const stats = {
      totalPersonnel: Object.keys(personnelStats).length,
      totalShifts: 0,
      totalHours: 0,
      averageEfficiency: 0,
      maxEfficiency: 0,
      minEfficiency: 100,
      maxConsecutiveDays: 0,
      maxConsecutiveEmployee: '',
    };

    Object.values(personnelStats).forEach((person) => {
      stats.totalShifts += person.totalShifts;
      stats.totalHours += person.totalHours;
      stats.averageEfficiency += person.efficiency;
      stats.maxEfficiency = Math.max(stats.maxEfficiency, person.efficiency);
      stats.minEfficiency = Math.min(stats.minEfficiency, person.efficiency);

      if (person.longestStreak > stats.maxConsecutiveDays) {
        stats.maxConsecutiveDays = person.longestStreak;
        stats.maxConsecutiveEmployee = person.name;
      }
    });

    stats.averageEfficiency =
      stats.totalPersonnel > 0 ? stats.averageEfficiency / stats.totalPersonnel : 0;

    return stats;
  }, [personnelStats]);

  // Toplam adam-gün karşılaştırması
  const staffingComparison = useMemo(() => {
    const totalPossibleShifts = totalWorkDays * activeEmployeeCount;
    const totalAssignedShifts = summaryStats.totalShifts;
    const staffingRate =
      totalPossibleShifts > 0 ? (totalAssignedShifts / totalPossibleShifts) * 100 : 0;

    return {
      totalPossibleShifts,
      totalAssignedShifts,
      staffingRate,
    };
  }, [totalWorkDays, activeEmployeeCount, summaryStats.totalShifts]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-blue-700">
          <i className="fas fa-clipboard-list mr-2"></i> Vardiya Dağılımı Özeti
        </h2>
        <span className="text-gray-600 text-sm">
          <i className="far fa-calendar-alt mr-1"></i> {displayDate}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Aktif Personel</h3>
          <div className="text-3xl font-bold text-blue-600">{activeEmployeeCount}</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Toplam Çalışma Günü</h3>
          <div className="text-3xl font-bold text-green-600">{totalWorkDays} gün</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Toplam Çalışma Saati</h3>
          <div className="text-3xl font-bold text-purple-600">{totalWorkHours} saat</div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Hafta Tatili Günleri</h3>
          <div className="text-3xl font-bold text-yellow-600">{totalWeekendDays} gün</div>
        </div>
      </div>

      <div className="mt-4">
        <button
          id="toggle-durumsuzluk"
          className="text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors"
        >
          <i className="fas fa-chevron-down" id="durumsuzluk-icon"></i> Detayları Göster
        </button>

        <div id="durumsuzluk-compact" className="mt-2">
          <div className="border rounded-lg p-3 bg-gray-50 text-sm text-gray-700">
            <p>
              <i className="fas fa-info-circle text-blue-500 mr-1"></i> Bu ay için toplam{' '}
              <span className="font-semibold">{daysInMonth}</span> günlük çizelge,{' '}
              <span className="font-semibold">{weekdayCount}</span> hafta içi ve{' '}
              <span className="font-semibold">{weekendCount}</span> hafta sonu günü içermektedir.
            </p>
          </div>
        </div>

        <div id="durumsuzluk-detailed" className="mt-2 hidden">
          <div className="border rounded-lg p-4 bg-gray-50 text-sm text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">Takvim Bilgileri</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Bu ay toplam <span className="font-semibold">{daysInMonth}</span> gün vardır.
                  </li>
                  <li>
                    Hafta içi gün sayısı: <span className="font-semibold">{weekdayCount}</span> gün
                  </li>
                  <li>
                    Hafta sonu gün sayısı: <span className="font-semibold">{weekendCount}</span> gün
                  </li>
                  <li>
                    Günlük çalışma saati: <span className="font-semibold">{averageShiftHours}</span>{' '}
                    saat
                  </li>
                </ul>

                <h4 className="font-semibold text-blue-700 mt-4 mb-2">Özet Veriler</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Toplam adam/gün: <span className="font-semibold">{totalManDays}</span> (Kişi ×
                    Gün)
                  </li>
                  <li>
                    Toplam adam/saat: <span className="font-semibold">{totalManHours}</span> (Kişi ×
                    Saat)
                  </li>
                  <li>
                    Toplam hafta sonu izni:{' '}
                    <span className="font-semibold">{totalManWeekendDays}</span> (Kişi × Gün)
                  </li>
                  <li>
                    Ortalama günlük çalışan:{' '}
                    <span className="font-semibold">{avgDailyWorkers.toFixed(1)}</span> kişi/gün
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-blue-700 mb-2">Vardiya Dağılımı</h4>
                {Object.keys(shiftDistribution.shiftTypeCount).length > 0 ? (
                  <div className="space-y-2">
                    {Object.keys(shiftDistribution.shiftTypeCount)
                      .sort()
                      .map((code) => (
                        <div key={code} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{code}</span> ({getShiftTypeName(code)}):
                          </div>
                          <div>
                            <span className="font-semibold">
                              {shiftDistribution.shiftTypeCount[code]}
                            </span>{' '}
                            vardiya
                            <span className="text-gray-500 text-xs ml-1">
                              ({shiftDistribution.shiftTypePercentage[code]}%)
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Henüz vardiya verisi bulunmuyor.</p>
                )}

                <h4 className="font-semibold text-blue-700 mt-4 mb-2">İzin Dağılımı</h4>
                {Object.keys(leaveDistribution.leaveTypeCount).length > 0 ? (
                  <div className="space-y-2">
                    {Object.keys(leaveDistribution.leaveTypeCount)
                      .sort()
                      .map((code) => (
                        <div key={code} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{code}</span> (
                            {leaveTypeNames[code] || code}):
                          </div>
                          <div>
                            <span className="font-semibold">
                              {leaveDistribution.leaveTypeCount[code]}
                            </span>{' '}
                            gün
                            <span className="text-gray-500 text-xs ml-1">
                              ({leaveDistribution.leaveTypePercentage[code]}%)
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Henüz izin verisi bulunmuyor.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personel Bazlı Rapor Bölümü */}
        <div className="mt-4">
          <button
            id="toggle-personnel-report"
            className="text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors"
            onClick={() => {
              const reportSection = document.getElementById('personnel-report-section');
              const toggleIcon = document.getElementById('personnel-report-icon');

              if (reportSection && toggleIcon) {
                reportSection.classList.toggle('hidden');

                if (reportSection.classList.contains('hidden')) {
                  toggleIcon.className = 'fas fa-chevron-down';
                  document.getElementById('toggle-personnel-report')!.innerHTML =
                    '<i class="fas fa-chevron-down" id="personnel-report-icon"></i> Personel Raporu Göster';
                } else {
                  toggleIcon.className = 'fas fa-chevron-up';
                  document.getElementById('toggle-personnel-report')!.innerHTML =
                    '<i class="fas fa-chevron-up" id="personnel-report-icon"></i> Personel Raporu Gizle';
                }
              }
            }}
          >
            <i className="fas fa-chevron-down" id="personnel-report-icon"></i> Personel Raporu
            Göster
          </button>

          <div id="personnel-report-section" className="mt-2 hidden">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold text-blue-700 mb-4">
                <i className="fas fa-user-clock mr-2"></i> Personel Bazlı Vardiya Raporu
              </h4>

              {/* Personel Özet İstatistikleri */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-700 mb-3">Vardiya Özet İstatistikleri</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500">Ortalama Personel Verimliliği</div>
                    <div className="text-xl font-bold text-blue-600">
                      {summaryStats.averageEfficiency.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Min: {summaryStats.minEfficiency.toFixed(1)}% / Max:{' '}
                      {summaryStats.maxEfficiency.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500">Dağıtılan Vardiyalar</div>
                    <div className="text-xl font-bold text-green-600">
                      {summaryStats.totalShifts}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Toplam {summaryStats.totalHours.toFixed(1)} saat çalışma
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500">Personel Doluluk Oranı</div>
                    <div className="text-xl font-bold text-purple-600">
                      {staffingComparison.staffingRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {staffingComparison.totalAssignedShifts} /{' '}
                      {staffingComparison.totalPossibleShifts} adam-gün
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500">En Uzun Ardışık Çalışma</div>
                    <div className="text-xl font-bold text-amber-600">
                      {summaryStats.maxConsecutiveDays} gün
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {summaryStats.maxConsecutiveEmployee}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtreleme ve Sıralama Arayüzü */}
              <div className="mb-4 bg-white p-3 rounded-lg border border-gray-200">
                <h5 className="font-medium text-gray-700 mb-2">Rapor Filtresi</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Vardiya Tipine Göre</label>
                    <select
                      value={filterShiftType}
                      onChange={(e) => setFilterShiftType(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                    >
                      <option value="all">Tüm Vardiyalar</option>
                      {shiftTypes
                        .filter((type) => !['HT', 'YI', 'UI', 'R', 'MZ', 'RT'].includes(type.code))
                        .map((type) => (
                          <option key={type.code} value={type.code}>
                            {type.code} ({type.name})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Sıralama</label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                    >
                      <option value="totalShifts">Toplam Vardiya (Azalan)</option>
                      <option value="efficiency">Verimlilik (Azalan)</option>
                      <option value="totalHours">Toplam Saat (Azalan)</option>
                      <option value="weekendShifts">Hafta Sonu (Azalan)</option>
                      <option value="longestStreak">Ardışık Çalışma (Azalan)</option>
                      <option value="name">İsim (A-Z)</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setFilterShiftType('all');
                        setSortOption('totalShifts');
                      }}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
                    >
                      Filtreleri Sıfırla
                    </button>
                  </div>
                </div>
              </div>

              {/* Ana Tablo */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-3 border-b border-r text-left sticky left-0 bg-gray-100">
                        Personel
                      </th>
                      <th className="py-2 px-3 border-b border-r text-center">Toplam Vardiya</th>
                      <th className="py-2 px-3 border-b border-r text-center">Toplam Saat</th>
                      <th className="py-2 px-3 border-b border-r text-center">Hafta İçi</th>
                      <th className="py-2 px-3 border-b border-r text-center">Hafta Sonu</th>
                      <th className="py-2 px-3 border-b border-r text-center">Verimlilik</th>
                      <th className="py-2 px-3 border-b border-r text-center">Ardışık Çalışma</th>
                      <th className="py-2 px-3 border-b border-r text-center">Vardiya Dağılımı</th>
                      <th className="py-2 px-3 border-b text-center">İzin Dağılımı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedPersonnel.map((person) => (
                      <tr key={person.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 border-b border-r font-medium sticky left-0 bg-white">
                          {person.name}
                        </td>
                        <td className="py-2 px-3 border-b border-r text-center">
                          {person.totalShifts}
                        </td>
                        <td className="py-2 px-3 border-b border-r text-center">
                          <div>{person.totalHours.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">
                            (Ort: {person.averageHoursPerShift.toFixed(1)} saat/vardiya)
                          </div>
                        </td>
                        <td className="py-2 px-3 border-b border-r text-center">
                          {person.weekdayShifts}
                          <div className="text-xs text-gray-500">
                            ({((person.weekdayShifts / person.totalShifts) * 100).toFixed(0)}%)
                          </div>
                        </td>
                        <td className="py-2 px-3 border-b border-r text-center">
                          {person.weekendShifts}
                          <div className="text-xs text-gray-500">
                            ({((person.weekendShifts / person.totalShifts) * 100).toFixed(0)}%)
                          </div>
                        </td>
                        <td className="py-2 px-3 border-b border-r text-center">
                          <div>
                            <span>{person.efficiency.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 border-b border-r text-center">
                          <div className="font-medium">{person.longestStreak} gün</div>
                          <div className="text-xs text-gray-500">
                            {person.firstShiftDay && person.lastShiftDay
                              ? `${person.lastShiftDay - person.firstShiftDay + 1} gün içinde`
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="py-2 px-3 border-b border-r">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {Object.entries(person.shifts)
                              .filter(([code, count]) => count > 0)
                              .sort(([a], [b]) => a.localeCompare(b))
                              .map(([code, count]) => {
                                const shiftType = shiftTypes.find((s) => s.code === code);
                                const percentage = ((count / person.totalShifts) * 100).toFixed(0);
                                return (
                                  <span
                                    key={code}
                                    className="inline-flex flex-col items-center px-2 py-1 rounded text-xs font-medium"
                                    style={{
                                      backgroundColor: shiftType?.color
                                        ? `var(--color-${shiftType.color}-100)`
                                        : '#f3f4f6',
                                      color: shiftType?.color
                                        ? `var(--color-${shiftType.color}-800)`
                                        : '#1f2937',
                                      border: `1px solid ${
                                        shiftType?.color
                                          ? `var(--color-${shiftType.color}-300)`
                                          : '#e5e7eb'
                                      }`,
                                    }}
                                  >
                                    <div className="font-medium">
                                      {code}: {count}
                                    </div>
                                    <div className="text-xs opacity-80">{percentage}%</div>
                                  </span>
                                );
                              })}
                          </div>
                        </td>
                        <td className="py-2 px-3 border-b">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {Object.entries(person.leaves)
                              .filter(([code, count]) => count > 0)
                              .sort(([a], [b]) => a.localeCompare(b))
                              .map(([code, count]) => {
                                const bgColor =
                                  code === 'HT'
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                    : code === 'YI'
                                    ? 'bg-green-100 text-green-800 border-green-300'
                                    : code === 'UI'
                                    ? 'bg-red-100 text-red-800 border-red-300'
                                    : code === 'R'
                                    ? 'bg-orange-100 text-orange-800 border-orange-300'
                                    : code === 'MZ'
                                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                                    : code === 'RT'
                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                    : 'bg-gray-100 text-gray-800 border-gray-300';

                                return (
                                  <span
                                    key={code}
                                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${bgColor}`}
                                  >
                                    {code}: {count}
                                  </span>
                                );
                              })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Ek Notlar */}
              <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r">
                <h5 className="font-medium text-blue-800 mb-1">Açıklamalar</h5>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>
                    <strong>Verimlilik:</strong> Personelin potansiyel iş gününe oranla çalıştığı
                    gün sayısı
                  </li>
                  <li>
                    <strong>Ardışık Çalışma:</strong> Personelin aralıksız çalıştığı maksimum gün
                    sayısı
                  </li>
                  <li>
                    <strong>Vardiya Dağılımı:</strong> Alt çubuk, personelin ay içinde çalıştığı
                    günleri gösterir
                  </li>
                  <li>
                    <strong>Ortalama Saat:</strong> Personelin vardiya başına ortalama çalışma saati
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
