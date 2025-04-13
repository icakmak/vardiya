'use client';

import { ShiftType } from '@/app/context/ScheduleContext';

interface ShiftCodesProps {
  shiftTypes: ShiftType[];
}

export default function ShiftCodes({ shiftTypes }: ShiftCodesProps) {
  return (
    <>
      <h3 className="text-md font-semibold text-blue-700 mb-2">
        <i className="fas fa-palette mr-1"></i> Vardiya Kodları
      </h3>

      <div className="space-y-2">
        {shiftTypes.map((shift) => (
          <div key={shift.code} className="flex items-center tooltip">
            <div
              className={`w-8 h-8 flex items-center justify-center bg-${shift.color}-100 border border-${shift.color}-500 mr-2 rounded font-bold text-${shift.color}-800`}
            >
              {shift.code}
            </div>
            <span className="text-sm">{shift.name} Vardiyası</span>
            <span className="tooltiptext" id={`tooltip-${shift.name.toLowerCase()}-shift`}>
              {shift.startTime}-{shift.endTime} arası çalışma
            </span>
          </div>
        ))}

        <div className="flex items-center tooltip">
          <div className="w-8 h-8 flex items-center justify-center bg-yellow-100 border border-yellow-500 mr-2 rounded font-bold text-yellow-800">
            HT
          </div>
          <span className="text-sm">Hafta Tatili</span>
          <span className="tooltiptext">Hafta sonları (Cumartesi-Pazar)</span>
        </div>

        <div className="flex items-center tooltip">
          <div className="w-8 h-8 flex items-center justify-center bg-green-100 border border-green-500 mr-2 rounded font-bold text-green-800">
            Yİ
          </div>
          <span className="text-sm">Yıllık İzin</span>
          <span className="tooltiptext">İzinli gün (maaşlı)</span>
        </div>

        <div className="flex items-center tooltip">
          <div className="w-8 h-8 flex items-center justify-center bg-red-100 border border-red-500 mr-2 rounded font-bold text-red-800">
            Üİ
          </div>
          <span className="text-sm">Ücretsiz İzin</span>
          <span className="tooltiptext">İzinli gün (maaşsız)</span>
        </div>

        <div className="flex items-center tooltip">
          <div className="w-8 h-8 flex items-center justify-center bg-green-100 border border-green-500 mr-2 rounded font-bold text-green-800">
            R
          </div>
          <span className="text-sm">Rapor</span>
          <span className="tooltiptext">Sağlık raporu</span>
        </div>

        <div className="flex items-center tooltip">
          <div className="w-8 h-8 flex items-center justify-center bg-green-100 border border-green-500 mr-2 rounded font-bold text-green-800">
            MZ
          </div>
          <span className="text-sm">Mazeret İzni</span>
          <span className="tooltiptext">Mazeret izni (özel durumlar)</span>
        </div>

        <div className="flex items-center tooltip">
          <div className="w-8 h-8 flex items-center justify-center bg-green-100 border border-green-500 mr-2 rounded font-bold text-green-800">
            RT
          </div>
          <span className="text-sm">Resmi Tatil</span>
          <span className="tooltiptext">Resmi tatil günleri</span>
        </div>
      </div>
    </>
  );
}
