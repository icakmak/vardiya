'use client';

import { useState } from 'react';
import { useSchedule } from '@/app/context/ScheduleContext';

interface LeaveEditorProps {
  showLeaveEditor: boolean;
  setShowLeaveEditor: (show: boolean) => void;
  selectedEmployee: string;
  selectedDate: string;
}

export default function LeaveEditor({
  showLeaveEditor,
  setShowLeaveEditor,
  selectedEmployee,
  selectedDate,
}: LeaveEditorProps) {
  const [leaveType, setLeaveType] = useState<string>('');
  const { schedule, setSchedule } = useSchedule();

  const applyLeave = () => {
    if (!selectedEmployee || !selectedDate || !leaveType) {
      return;
    }

    // Burada context üzerinde schedule güncellemesi yapılabilir
    // Gerçek uygulamada çok daha gelişmiş olacak

    // İşlem tamamlandıktan sonra editörü gizle
    setShowLeaveEditor(false);
    setLeaveType('');
  };

  const cancelLeave = () => {
    setLeaveType('');
    setShowLeaveEditor(false);
  };

  if (!showLeaveEditor) {
    return (
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-xs text-gray-600 mb-2">
          Personele özel izin eklemek için vardiya tablosunda ilgili hücreye tıklayın
        </p>
        <div className="flex items-center p-2 bg-yellow-50 rounded-lg border border-yellow-200 mb-2">
          <div className="w-7 h-7 flex items-center justify-center bg-yellow-100 border border-yellow-500 mr-2 rounded font-bold text-yellow-800">
            <i className="fas fa-info-circle"></i>
          </div>
          <span className="text-xs">
            <span className="font-medium">Hafta Tatili (HT) günlerinde de vardiya atanabilir.</span>{' '}
            Atanan vardiyalar toplam çalışma saatlerine ve vardiya sayılarına eklenecektir.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="border-l-4 border-blue-500 pl-2 py-1 bg-blue-50 rounded text-sm mb-2">
        <span id="leave-editor-title" className="font-medium">
          {selectedEmployee ? selectedEmployee : 'Çalışan'} -{' '}
          {selectedDate ? selectedDate : 'Tarih'}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <select
          id="leave-type"
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled selected>
            İzin tipini seçin
          </option>
          <option value="YI">Yıllık İzin (Yİ)</option>
          <option value="UI">Ücretsiz İzin (Üİ)</option>
          <option value="R">Rapor (R)</option>
          <option value="MZ">Mazeret İzni (MZ)</option>
          <option value="RT">Resmi Tatil (RT)</option>
        </select>
        <div className="flex space-x-2">
          <button
            onClick={applyLeave}
            disabled={!leaveType}
            className={`flex-1 px-2 py-1 ${
              leaveType ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'
            } text-white text-xs font-medium rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          >
            Uygula
          </button>
          <button
            onClick={cancelLeave}
            className="flex-1 px-2 py-1 bg-gray-300 text-gray-700 text-xs font-medium rounded shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}
