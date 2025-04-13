'use client';

import { useSchedule } from '@/app/context/ScheduleContext';
import ShiftTypeButton from './ShiftTypeButton';

export default function VardiyaTipleri() {
  const { shiftTypes } = useSchedule();

  // Sadece çalışma vardiyalarını göster (HT gibi özel vardiyaları hariç tut)
  const workShiftTypes = shiftTypes.filter((type) => type.code !== 'HT');

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-gray-700">
          <i className="fas fa-clock mr-2"></i> Vardiya Tipleri
        </h3>
        <ShiftTypeButton />
      </div>

      <div className="space-y-3">
        {workShiftTypes.map((shift) => (
          <div
            key={shift.code}
            className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white bg-${shift.color}-500 font-bold`}
                >
                  {shift.code}
                </div>
                <div className="font-medium">{shift.name}</div>
              </div>
              <div className="text-sm text-gray-500">
                {shift.startTime} - {shift.endTime}
              </div>
            </div>
          </div>
        ))}

        {workShiftTypes.length === 0 && (
          <div className="p-4 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <i className="fas fa-info-circle mr-1"></i> Vardiya tipi bulunamadı
          </div>
        )}
      </div>
    </div>
  );
}
