'use client';

import { useSchedule } from '@/app/context/ScheduleContext';
import ExcelExport from './ExcelExport';

export default function ScheduleHeader() {
  const { selectedMonth, selectedYear } = useSchedule();

  // Ay adları
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

  return (
    <div className="flex flex-wrap md:flex-nowrap justify-between items-center mb-4">
      <div>
        <h3 className="text-xl font-bold text-gray-800">
          {monthNames[selectedMonth - 1]} {selectedYear} Vardiya Çizelgesi
        </h3>
        <p className="text-sm text-gray-500">
          <i className="fas fa-info-circle mr-1"></i> Bu çizelge otomatik olarak oluşturulmuştur.
        </p>
      </div>

      <div className="flex mt-3 md:mt-0">
        <ExcelExport />
      </div>
    </div>
  );
}
