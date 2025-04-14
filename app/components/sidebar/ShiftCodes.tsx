'use client';

import { ShiftType } from '@/app/context/ScheduleContext';
import { getShiftColorStyle } from '@/app/utils/colors';

interface ShiftCodesProps {
  shiftTypes: ShiftType[];
}

// İzin türleri için özel renk tanımlamaları
const leaveTypes = [
  {
    code: 'HT',
    name: 'Hafta Tatili',
    tooltip: 'Hafta sonları (Cumartesi-Pazar)',
    colorName: 'yellow',
  },
  { code: 'Yİ', name: 'Yıllık İzin', tooltip: 'İzinli gün (maaşlı)', colorName: 'green' },
  { code: 'Üİ', name: 'Ücretsiz İzin', tooltip: 'İzinli gün (maaşsız)', colorName: 'red' },
  { code: 'R', name: 'Rapor', tooltip: 'Sağlık raporu', colorName: 'green' },
  { code: 'MZ', name: 'Mazeret İzni', tooltip: 'Mazeret izni (özel durumlar)', colorName: 'green' },
  { code: 'RT', name: 'Resmi Tatil', tooltip: 'Resmi tatil günleri', colorName: 'green' },
];

export default function ShiftCodes({ shiftTypes }: ShiftCodesProps) {
  return (
    <>
      <h3 className="text-md font-semibold text-blue-700 mb-2">
        <i className="fas fa-palette mr-1"></i> Vardiya Kodları
      </h3>

      <div className="space-y-2">
        {shiftTypes.map((shift) => {
          // Vardiya için renk stili al
          const colorStyle = getShiftColorStyle(shift.color, 'vardiyaTipleri');

          return (
            <div key={shift.code} className="flex items-center tooltip">
              <div
                className="w-8 h-8 flex items-center justify-center mr-2 rounded font-bold shadow-sm"
                style={{
                  backgroundColor: colorStyle.backgroundColor,
                  borderColor: colorStyle.borderColor,
                  color: colorStyle.color,
                  border: '1px solid',
                }}
              >
                {shift.code}
              </div>
              <span className="text-sm">{shift.name} Vardiyası</span>
              <span className="tooltiptext" id={`tooltip-${shift.name.toLowerCase()}-shift`}>
                {shift.startTime}-{shift.endTime} arası çalışma
              </span>
            </div>
          );
        })}

        {/* İzin türleri - merkezi renk sistemini kullanıyoruz */}
        {leaveTypes.map((leave) => {
          const colorStyle = getShiftColorStyle(leave.colorName, 'vardiyaTipleri');

          return (
            <div key={leave.code} className="flex items-center tooltip">
              <div
                className="w-8 h-8 flex items-center justify-center mr-2 rounded font-bold shadow-sm"
                style={{
                  backgroundColor: colorStyle.backgroundColor,
                  borderColor: colorStyle.borderColor,
                  color: colorStyle.color,
                  border: '1px solid',
                }}
              >
                {leave.code}
              </div>
              <span className="text-sm">{leave.name}</span>
              <span className="tooltiptext">{leave.tooltip}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
