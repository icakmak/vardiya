'use client';

import { useSchedule } from '@/app/context/ScheduleContext';

export default function EmployeeStats() {
  const { employees } = useSchedule();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-md font-semibold text-gray-700 mb-2">
        <i className="fas fa-users mr-2"></i> Personel İstatistikleri
      </h3>

      <div className="space-y-2">
        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
          <div className="text-sm text-gray-700">Toplam Personel</div>
          <div className="font-semibold text-blue-600">{employees.length}</div>
        </div>

        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
          <div className="text-sm text-gray-700">Aktif Personel</div>
          <div className="font-semibold text-green-600">
            {employees.filter((emp) => emp.isActive).length}
          </div>
        </div>
      </div>
    </div>
  );
}
