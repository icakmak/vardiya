'use client';

import { useSchedule } from '@/app/context/ScheduleContext';

export default function ShiftDistribution() {
  const { employees, shiftTypes, shiftCounts } = useSchedule();

  // Boş bir dağılım tablosu oluştur
  if (Object.keys(shiftCounts).length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-blue-700">
          <i className="fas fa-chart-pie mr-2"></i> Vardiya Dağılımı ve İstatistikler
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
              <th className="py-2 px-4 border-b border-r text-left text-xs font-medium text-gray-600 uppercase tracking-wider sticky left-0 bg-white">
                Ad Soyad
              </th>
              {shiftTypes.map((type) => (
                <th
                  key={type.code}
                  className="py-2 px-4 border-b border-r text-center text-xs font-medium text-gray-600 uppercase tracking-wider"
                >
                  <div
                    className={`inline-flex w-6 h-6 items-center justify-center bg-${type.color}-100 border border-${type.color}-500 mr-1 rounded font-bold text-${type.color}-800`}
                  >
                    {type.code}
                  </div>
                </th>
              ))}
              <th className="py-2 px-4 border-b border-r text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Hafta İçi
              </th>
              <th className="py-2 px-4 border-b border-r text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Hafta Sonu
              </th>
              <th className="py-2 px-4 border-b border-r text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Toplam
              </th>
              <th className="py-2 px-4 border-b text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Toplam Saat
              </th>
            </tr>
          </thead>
          <tbody id="employee-distribution">
            {employees.map((employee) => {
              // Çalışan için vardiya sayılarını al
              const employeeShiftCounts = shiftCounts[employee.id] || {};

              return (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b border-r font-medium sticky left-0 bg-white">
                    {employee.adSoyad}
                  </td>

                  {/* Her vardiya tipi için sayılar */}
                  {shiftTypes.map((type) => (
                    <td
                      key={`${employee.id}-${type.code}`}
                      className="py-2 px-4 border-b border-r text-center"
                    >
                      {employeeShiftCounts[type.code] || 0}
                    </td>
                  ))}

                  {/* Hafta içi, Hafta sonu ve Toplam İstatistikleri */}
                  <td className="py-2 px-4 border-b border-r text-center">
                    {employeeShiftCounts.totalWeekdays || 0}
                  </td>
                  <td className="py-2 px-4 border-b border-r text-center">
                    {employeeShiftCounts.totalWeekends || 0}
                  </td>
                  <td className="py-2 px-4 border-b border-r text-center font-semibold">
                    {employeeShiftCounts.total || 0}
                  </td>
                  <td className="py-2 px-4 border-b text-center font-semibold">
                    {employeeShiftCounts.totalHours || 0} saat
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
