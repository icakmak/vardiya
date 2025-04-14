'use client';

import { useState, useEffect } from 'react';
import { useSchedule } from '@/app/context/ScheduleContext';
import ScheduleHeader from '@/app/components/main/ScheduleHeader';
import ScheduleTable from '@/app/components/main/ScheduleTable';
import ScheduleStats from '@/app/components/main/ScheduleStats';
import ShiftDistribution from '@/app/components/main/ShiftDistribution';
import LeaveTypes from '@/app/components/main/LeaveTypes';
import ExcelExport from '@/app/components/main/ExcelExport';

export default function MainContent() {
  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    employees,
    setSchedule,
    shiftTypes,
    showSchedule,
    setShowSchedule,
  } = useSchedule();
  const [lateTolerance, setLateTolerance] = useState<number>(5);
  const [earlyTolerance, setEarlyTolerance] = useState<number>(5);

  // Sayfa yüklendiğinde veya değiştiğinde arama butonuna olay dinleyicisi ekle
  useEffect(() => {
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', generateSchedule);

      // Temizlik fonksiyonu
      return () => {
        searchBtn.removeEventListener('click', generateSchedule);
      };
    }
  }, [employees, shiftTypes]);

  // Çalışanları izle
  useEffect(() => {
    console.log('MainContent - Çalışanlar değişti:', employees?.length);
  }, [employees]);

  // Ay veya yıl değiştiğinde otomatik olarak çizelgeyi yeniden oluştur
  useEffect(() => {
    // Çalışan ve vardiya tipi kontrolü
    if (employees && employees.length > 0 && shiftTypes.some((type) => type.code !== 'HT')) {
      // Daha önce çizelge görüntülenmişse, ay veya yıl değiştiğinde otomatik yenile
      if (showSchedule) {
        generateSchedule();
        console.log('Ay veya yıl değiştiği için çizelge otomatik yenilendi');
      }
    }
  }, [selectedMonth, selectedYear]);

  // Çizelge oluşturmak için fonksiyon
  const generateSchedule = () => {
    // Hata ayıklama için log ekleyelim
    console.log('Çalışan sayısı:', employees?.length);
    console.log('Çalışanlar:', employees);
    console.log('Vardiya Tipleri:', shiftTypes);

    // Çalışan listesi kontrolü
    if (!employees || employees.length === 0) {
      alert('Lütfen önce bir Excel dosyası yükleyin!');
      return;
    }

    // Vardiya tipleri kontrolü (HT hariç en az bir vardiya tipi olmalı)
    const workShiftTypes = shiftTypes.filter((type) => type.code !== 'HT');
    if (workShiftTypes.length === 0) {
      alert('Lütfen en az bir vardiya tipi ekleyin!');
      return;
    }

    // Boş bir çizelge oluşturalım
    const newSchedule: { [employeeId: string]: (string | null)[] } = {};

    // Her çalışan için boş bir çizelge oluştur
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    employees.forEach((emp) => {
      newSchedule[emp.id] = Array(daysInMonth + 1).fill(null);
    });

    // Vardiyaları adil şekilde dağıt
    distributeShifts(newSchedule, daysInMonth);

    // Schedule'ı güncelle
    setSchedule(newSchedule);

    // Hata ayıklama için log
    console.log('Çizelge oluşturuldu:', newSchedule);

    // Çizelgeyi göster
    setShowSchedule(true);
  };

  // Vardiyaları dağıtma fonksiyonu
  const distributeShifts = (
    schedule: { [employeeId: string]: (string | null)[] },
    daysInMonth: number,
  ) => {
    // Değişkenleri bu satırın dışında tanımlayalım, useSchedule hook'unu aşağıda çağıramayız
    const employeeIds = employees.map((emp) => emp.id);

    // YENİ: Kullanılabilir tüm vardiya tiplerini alalım
    // Vardiya tiplerini context'ten al (A, B, C, vs gibi çalışma vardiyaları)
    // Sadece HT tipini ayır, çünkü o sadece hafta sonu için
    const workShiftTypes = shiftTypes.filter((type) => type.code !== 'HT');
    const vardiyalar = workShiftTypes.map((shift) => shift.code);

    console.log('Dağıtılacak vardiya tipleri:', vardiyalar);

    // Hafta Tatili kodunu bul
    const htVardiya = shiftTypes.find((type) => type.code === 'HT')?.code || 'HT';

    // Hafta içi ve hafta sonu günleri belirleme
    const weekendDays: number[] = [];
    const weekDays: number[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = date.getDay(); // 0: Pazar, 6: Cumartesi

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDays.push(day);
      } else {
        weekDays.push(day);
      }
    }

    // Çalışanları karıştır
    const shuffledEmployees = [...employeeIds].sort(() => 0.5 - Math.random());

    // Vardiya dağıtımı için sayaçlar
    const shiftCounts: Record<string, Record<string, number>> = {};
    employeeIds.forEach((id) => {
      shiftCounts[id] = {};
      vardiyalar.forEach((vardiya) => {
        shiftCounts[id][vardiya] = 0;
      });
      shiftCounts[id].total = 0;
    });

    // Hafta içi günlere çalışma vardiyalarını dağıt
    for (let day of weekDays) {
      // Her vardiya tipini dağıt (tüm çalışma vardiyalarını kullan)
      vardiyalar.forEach((vardiya, vardiyaIndex) => {
        // Her vardiya için çalışanları sıralı dağıt
        let assignedEmployees = 0;

        // Çalışan sayısının vardiya tipine bölünmüş kadarı her vardiya tipinden atama yap
        const targetAssignments = Math.max(1, Math.floor(employeeIds.length / vardiyalar.length));

        // En az vardiya alan çalışanları bul
        const sortedEmployees = [...shuffledEmployees].sort((a, b) => {
          const totalA = shiftCounts[a].total || 0;
          const totalB = shiftCounts[b].total || 0;

          // Aynı sayıda vardiya almışlarsa, bu vardiyayı daha az almış olana öncelik ver
          if (totalA === totalB) {
            return (shiftCounts[a][vardiya] || 0) - (shiftCounts[b][vardiya] || 0);
          }
          return totalA - totalB;
        });

        // Sırayla çalışanlara vardiya ata, hedef sayıya ulaşana kadar
        for (const empId of sortedEmployees) {
          if (assignedEmployees >= targetAssignments) break;

          // Eğer bu gün için zaten vardiya atanmışsa, bu çalışanı atla
          if (schedule[empId][day] !== null) continue;

          // Eğer bu çalışan son 2 günde aynı vardiyayı almadıysa ata
          const lastFewDays = day > 2 ? [day - 1, day - 2] : [day - 1];
          const hasRecentSameShift = lastFewDays.some((prevDay) => {
            return prevDay > 0 && schedule[empId][prevDay] === vardiya;
          });

          // Son 3 günde herhangi bir vardiya almadıysa ata
          const hasConsecutiveShifts =
            day > 3 &&
            schedule[empId][day - 1] !== null &&
            schedule[empId][day - 2] !== null &&
            schedule[empId][day - 3] !== null;

          if (!hasRecentSameShift && !hasConsecutiveShifts) {
            schedule[empId][day] = vardiya;
            shiftCounts[empId][vardiya] = (shiftCounts[empId][vardiya] || 0) + 1;
            shiftCounts[empId].total = (shiftCounts[empId].total || 0) + 1;
            assignedEmployees++;
          }
        }
      });
    }

    // Hafta sonu günlere HT ata (tüm çalışanlara)
    for (let day of weekendDays) {
      employeeIds.forEach((empId) => {
        schedule[empId][day] = htVardiya; // Hafta Tatili sadece hafta sonu
      });
    }

    // Henüz atanmamış günlere vardiya ata (hafta içinde boşluk kalmasın)
    for (let day = 1; day <= daysInMonth; day++) {
      // Hafta sonu ise atla (zaten HT atanmış olmalı)
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // Her çalışan için
      employeeIds.forEach((empId) => {
        // Eğer boşsa ve vardiya atanmamışsa, en uygun vardiyayı ata
        if (schedule[empId][day] === null) {
          // En az vardiya alan vardiya tipini bul
          let minCount = Infinity;
          let selectedVardiya = vardiyalar[0];

          vardiyalar.forEach((vardiya) => {
            const count = shiftCounts[empId][vardiya] || 0;
            if (count < minCount) {
              minCount = count;
              selectedVardiya = vardiya;
            }
          });

          // En az vardiya tipi atanmış olanı seç
          schedule[empId][day] = selectedVardiya;
          shiftCounts[empId][selectedVardiya] = (shiftCounts[empId][selectedVardiya] || 0) + 1;
          shiftCounts[empId].total = (shiftCounts[empId].total || 0) + 1;
        }
      });
    }

    return schedule;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 no-print">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-blue-700">
            <i className="fas fa-file-alt mr-2"></i> Puantaj (Detaylı Görünüm)
          </h2>
          <div className="text-sm text-gray-500">
            <i className="fas fa-info-circle mr-1"></i> Tarih ve parametreleri belirleyin
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4 md:col-span-3 bg-gray-50 p-3 rounded-lg transition-all hover:shadow-md">
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
              <i className="far fa-calendar-alt mr-1"></i> Ay
            </label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Ocak</option>
              <option value={2}>Şubat</option>
              <option value={3}>Mart</option>
              <option value={4}>Nisan</option>
              <option value={5}>Mayıs</option>
              <option value={6}>Haziran</option>
              <option value={7}>Temmuz</option>
              <option value={8}>Ağustos</option>
              <option value={9}>Eylül</option>
              <option value={10}>Ekim</option>
              <option value={11}>Kasım</option>
              <option value={12}>Aralık</option>
            </select>
          </div>

          <div className="col-span-4 md:col-span-3 bg-gray-50 p-3 rounded-lg transition-all hover:shadow-md">
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              <i className="far fa-calendar-check mr-1"></i> Yıl
            </label>
            <input
              type="number"
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="2023"
              max="2100"
            />
          </div>

          <div className="col-span-4 md:col-span-3 bg-gray-50 p-3 rounded-lg transition-all hover:shadow-md">
            <label
              htmlFor="late-tolerance"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <i className="fas fa-hourglass-start mr-1"></i> Geç kalma toleransı
            </label>
            <input
              type="number"
              id="late-tolerance"
              value={lateTolerance}
              onChange={(e) => setLateTolerance(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="60"
            />
          </div>

          <div className="col-span-4 md:col-span-3 bg-gray-50 p-3 rounded-lg transition-all hover:shadow-md">
            <label
              htmlFor="early-tolerance"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <i className="fas fa-hourglass-end mr-1"></i> Erken çıkış toleransı
            </label>
            <input
              type="number"
              id="early-tolerance"
              value={earlyTolerance}
              onChange={(e) => setEarlyTolerance(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="60"
            />
          </div>
        </div>
      </div>

      {showSchedule && (
        <>
          <ScheduleStats />

          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <ScheduleHeader />
            <ScheduleTable />
          </div>

          <ShiftDistribution />

          <div className="bg-white rounded-lg shadow-md p-4 mb-4 print-break-after">
            <LeaveTypes />
          </div>
        </>
      )}
    </>
  );
}
