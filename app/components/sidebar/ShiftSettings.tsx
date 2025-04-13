'use client';

import { useState } from 'react';
import { useSchedule, ShiftType } from '@/app/context/ScheduleContext';

export default function ShiftSettings() {
  const { shiftTypes, setShiftTypes } = useSchedule();
  const [shiftHours, setShiftHours] = useState<string>('8');
  const [consecutiveDays, setConsecutiveDays] = useState<number>(5);
  const [mealBreak, setMealBreak] = useState<number>(60);

  const addShiftType = () => {
    // Vardiya tipi ekleme modalını aç
    if (document.getElementById('shift-type-modal')) {
      document.getElementById('shift-type-modal')!.classList.remove('hidden');
    }
  };

  const handleDeleteShiftType = (code: string) => {
    // Varsayılan vardiyaları silmeye izin verme
    if (code === 'A' || code === 'B') {
      alert('Varsayılan vardiyalar silinemez!');
      return;
    }

    // Silme onayı al
    if (confirm(`${code} kodlu vardiyayı silmek istediğinize emin misiniz?`)) {
      setShiftTypes(shiftTypes.filter((shift) => shift.code !== code));
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-md font-semibold text-blue-700 mb-2">
        <i className="fas fa-cogs mr-1"></i> Vardiya Ayarları
      </h3>

      <div className="space-y-3">
        <div className="bg-gray-50 p-2 rounded-lg transition-all hover:shadow-md">
          <label htmlFor="shift-hours" className="block text-xs font-medium text-gray-700 mb-1">
            <i className="far fa-clock mr-1"></i> Vardiya süresi
          </label>
          <select
            id="shift-hours"
            value={shiftHours}
            onChange={(e) => setShiftHours(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="8">8 saat</option>
            <option value="9">9 saat</option>
            <option value="10">10 saat</option>
            <option value="12">12 saat</option>
          </select>
        </div>

        <div className="bg-gray-50 p-2 rounded-lg transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-medium text-gray-700">
              <i className="fas fa-layer-group mr-1"></i> Vardiya Tipleri
            </label>
            <button
              onClick={addShiftType}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              <i className="fas fa-plus-circle"></i> Yeni Ekle
            </button>
          </div>

          <div id="shift-types-container">
            {shiftTypes.map((shift) => (
              <div
                key={shift.code}
                className="mb-2 border border-gray-200 rounded p-2 bg-white shift-type-item"
              >
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 flex items-center justify-center bg-${shift.color}-100 border border-${shift.color}-500 mr-1 rounded font-bold text-${shift.color}-800`}
                    >
                      {shift.code}
                    </div>
                    <span className="text-xs font-medium">{shift.name}</span>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleDeleteShiftType(shift.code)}
                      className={`text-xs text-red-500 hover:text-red-700 ml-1 shift-type-delete ${
                        shift.code === 'A' || shift.code === 'B' ? 'hidden' : ''
                      }`}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="time"
                    value={shift.startTime}
                    className="w-full px-1 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 shift-start"
                    readOnly
                  />
                  <input
                    type="time"
                    value={shift.endTime}
                    className="w-full px-1 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 shift-end"
                    readOnly
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-2 rounded-lg transition-all hover:shadow-md">
          <label
            htmlFor="consecutive-days"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            <i className="fas fa-calendar-week mr-1"></i> Maks. ardışık çalışma
          </label>
          <input
            type="number"
            id="consecutive-days"
            value={consecutiveDays}
            onChange={(e) => setConsecutiveDays(parseInt(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="7"
          />
        </div>

        <div className="bg-gray-50 p-2 rounded-lg transition-all hover:shadow-md">
          <label htmlFor="meal-break" className="block text-xs font-medium text-gray-700 mb-1">
            <i className="fas fa-utensils mr-1"></i> Yemek molası (dk)
          </label>
          <input
            type="number"
            id="meal-break"
            value={mealBreak}
            onChange={(e) => setMealBreak(parseInt(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="120"
          />
        </div>
      </div>
    </div>
  );
}
