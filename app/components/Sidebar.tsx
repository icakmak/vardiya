'use client';

import { useState } from 'react';
import { useSchedule } from '@/app/context/ScheduleContext';
import UploadExcel from './sidebar/UploadExcel';
import ShiftSettings from './sidebar/ShiftSettings';
import LeaveEditor from './sidebar/LeaveEditor';
import ShiftCodes from './sidebar/ShiftCodes';

export default function Sidebar() {
  const { shiftTypes } = useSchedule();
  const [showLeaveEditor, setShowLeaveEditor] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 no-print">
        <UploadExcel />
        <ShiftSettings />

        <div className="mt-4">
          <div className="grid grid-cols-1 gap-2">
            <button
              id="search-btn"
              className="w-full px-3 py-2 bg-rose-500 text-white font-medium rounded-lg shadow-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 transition-colors flex items-center justify-center"
            >
              <i className="fas fa-calendar-check mr-2"></i>
              Vardiya Çizelgesi Oluştur
            </button>

            {/* <button
              id="export-excel"
              className="w-full px-3 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors flex items-center justify-center text-sm"
            >
              <i className="fas fa-file-excel mr-1"></i>
              Excel'e Aktar
            </button> */}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-md font-semibold text-blue-700 mb-2">
            <i className="fas fa-user-clock mr-1"></i> İzin Ekleme
          </h3>

          <LeaveEditor
            showLeaveEditor={showLeaveEditor}
            setShowLeaveEditor={setShowLeaveEditor}
            selectedEmployee={selectedEmployee}
            selectedDate={selectedDate}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-4 no-print">
        <ShiftCodes shiftTypes={shiftTypes} />
      </div>
    </>
  );
}
