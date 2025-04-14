'use client';

import { useState } from 'react';
import UploadShiftTypesExcel from './UploadShiftTypesExcel';
import { useSchedule } from '@/app/context/ScheduleContext';
import { getShiftColorStyle, shiftColors } from '@/app/utils/colors';

interface ColorStyle {
  bg: string;
  text: string;
  border: string;
}

interface ShiftSettingsProps {
  onShiftTypesUploaded?: () => void;
}

export default function ShiftSettings({ onShiftTypesUploaded }: ShiftSettingsProps = {}) {
  const { shiftTypes, setShiftTypes } = useSchedule();
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

  const handleTimeChange = (code: string, field: 'startTime' | 'endTime', value: string) => {
    setShiftTypes(
      shiftTypes.map((shift) => (shift.code === code ? { ...shift, [field]: value } : shift)),
    );
  };

  const handleColorSelect = (color: string) => {
    // Bu fonksiyon, yeni renk seçme UI'ı için hazırlık, şu an aktif kullanılmıyor
    console.log('Renk seçildi:', color);
  };

  const getColorStyle = (colorName: string): ColorStyle => {
    const style = getShiftColorStyle(colorName, 'vardiyaTipleri');

    return {
      bg: style.backgroundColor,
      text: style.color,
      border: style.borderColor,
    };
  };

  const renderColorOption = (color: string) => {
    const colorStyle = getColorStyle(color);

    return (
      <div
        key={color}
        className="w-8 h-8 rounded-full cursor-pointer flex items-center justify-center shadow-sm hover:scale-110 transition-transform border"
        style={{
          backgroundColor: colorStyle.bg,
          borderColor: colorStyle.border,
        }}
        onClick={() => handleColorSelect(color)}
      >
        <span
          className="w-4 h-4 block rounded-full"
          style={{ backgroundColor: colorStyle.text }}
        ></span>
      </div>
    );
  };

  const getDotStyle = (color: string) => {
    const style = getColorStyle(color);
    return {
      backgroundColor: style.bg,
      borderColor: style.border,
      color: style.text,
    };
  };

  return (
    <div className="mt-4">
      <h3 className="text-md font-semibold text-blue-700 mb-2">
        <i className="fas fa-cogs mr-1"></i> Vardiya Ayarları
      </h3>

      <div className="space-y-3">
        {/* Vardiya Tipi Excel yükleme bileşeni */}
        <div className="bg-gray-50 p-2 rounded-lg transition-all hover:shadow-md">
          <UploadShiftTypesExcel onShiftTypesUploaded={onShiftTypesUploaded} />
        </div>

        <div className="border-t border-gray-300 my-3"></div>

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
            {shiftTypes.map((shift) => {
              console.log(shift);
              // Varsayılan veya geçersiz renk için gri kullan
              const colorStyle = getColorStyle(shift.color);
              const bgColor = colorStyle.bg;
              const textColor = colorStyle.text || '#1f2937';
              const borderColor = colorStyle.border || '#6b7280';

              return (
                <div
                  key={shift.code}
                  className="mb-2 border border-gray-200 rounded p-2 bg-white shift-type-item"
                >
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center">
                      <div
                        className="w-6 h-6 flex items-center justify-center mr-1 rounded font-bold"
                        style={{
                          backgroundColor: bgColor,
                          color: textColor,
                          border: `1px solid ${borderColor}`,
                        }}
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
                      onChange={(e) => handleTimeChange(shift.code, 'startTime', e.target.value)}
                      className="w-full px-1 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 shift-start"
                      required
                    />
                    <input
                      type="time"
                      value={shift.endTime}
                      onChange={(e) => handleTimeChange(shift.code, 'endTime', e.target.value)}
                      className="w-full px-1 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 shift-end"
                      required
                    />
                  </div>
                </div>
              );
            })}
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
