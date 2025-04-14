'use client';

import { useState, useEffect } from 'react';
import { useSchedule } from '@/app/context/ScheduleContext';
import { getShiftColorStyle } from '@/app/utils/colors';

export default function CellEditModal() {
  const { shiftTypes, schedule, setSchedule } = useSchedule();
  const [isOpen, setIsOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [day, setDay] = useState<number>(0);
  const [employeeName, setEmployeeName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [editMode, setEditMode] = useState<'shift' | 'leave' | null>(null);
  const [selectedValue, setSelectedValue] = useState<string>('');

  // Sayfa yüklendiğinde modal DOM elementini referans olarak al
  useEffect(() => {
    const modal = document.getElementById('cell-edit-modal');
    console.log('Cell edit modal initialized:', modal);

    // MutationObserver ile DOM değişikliklerini izle
    if (modal) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isHidden = modal.classList.contains('hidden');
            setIsOpen(!isHidden);
            console.log('Modal visibility changed. isHidden:', isHidden);

            // Modal kapandığında verileri sıfırla
            if (isHidden) {
              setEditMode(null);
              setSelectedValue('');
            }
          }
        });
      });

      observer.observe(modal, { attributes: true });

      // Cleanup
      return () => observer.disconnect();
    }
  }, []);

  // Global bir fonksiyon olarak hücre düzenleme modalını aç
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - Global fonksiyon olarak tanımlıyoruz
      window.showCellEditModal = (
        employeeId: string,
        employeeName: string,
        day: number,
        date: string,
      ) => {
        console.log('showCellEditModal çağrıldı:', employeeId, employeeName, day, date);

        setEmployeeId(employeeId);
        setEmployeeName(employeeName);
        setDay(day);
        setDate(date);

        const modal = document.getElementById('cell-edit-modal');
        if (modal) {
          console.log('Modal açılıyor');
          modal.classList.remove('hidden');

          // Şu anki vardiya değerini seç
          const currentValue = schedule[employeeId]?.[day];
          console.log('Mevcut vardiya değeri:', currentValue);

          // Varsayılan olarak vardiya düzenleme modunu seç
          const isLeaveType = ['YI', 'UI', 'R', 'MZ', 'RT'].includes(currentValue || '');
          setEditMode(isLeaveType ? 'leave' : 'shift');

          // Mevcut değeri seç
          if (currentValue) {
            setSelectedValue(currentValue);
          }
        } else {
          console.error('Modal elementi bulunamadı: cell-edit-modal');
        }
      };

      console.log('showCellEditModal fonksiyonu tanımlandı');
    }
  }, [schedule]);

  const handleClose = () => {
    const modal = document.getElementById('cell-edit-modal');
    if (modal) modal.classList.add('hidden');
    setIsOpen(false);
    console.log('Modal kapatıldı');
  };

  const setShiftMode = () => {
    setEditMode('shift');
    setSelectedValue('');
    console.log('Vardiya düzenleme modu seçildi');
  };

  const setLeaveMode = () => {
    setEditMode('leave');
    setSelectedValue('');
    console.log('İzin düzenleme modu seçildi');
  };

  const handleShiftSelect = (code: string) => {
    setSelectedValue(code);
    console.log('Vardiya seçildi:', code);
  };

  const handleLeaveSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value);
    console.log('İzin tipi seçildi:', e.target.value);
  };

  const handleApply = () => {
    // Gerekli alanların dolu olup olmadığını kontrol et
    if (!employeeId) {
      console.error('Çalışan ID bilgisi eksik');
      return;
    }

    if (day <= 0) {
      console.error('Geçersiz gün değeri:', day);
      return;
    }

    if (!selectedValue) {
      console.error('Lütfen bir vardiya veya izin tipi seçin');
      return;
    }

    console.log('Değişiklik uygulanıyor:', {
      employeeId,
      employeeName,
      day,
      selectedValue,
    });

    try {
      // Schedule'ı güncelle
      const newSchedule = { ...schedule };

      // Eğer bu çalışan için henüz dizi yoksa oluştur
      if (!newSchedule[employeeId]) {
        const daysInMonth = new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0,
        ).getDate();
        newSchedule[employeeId] = Array(daysInMonth + 1).fill(null);
        console.log('Çalışan için yeni dizi oluşturuldu');
      }

      // Güncellemeyi yap
      newSchedule[employeeId][day] = selectedValue;
      console.log('Yeni çizelge:', newSchedule);

      // Güncellenmiş schedule'ı set et
      setSchedule(newSchedule);
      console.log('Çizelge güncellendi');

      // Modalı kapat
      handleClose();
    } catch (error) {
      console.error('Vardiya güncellenirken bir hata oluştu:', error);
      alert('Vardiya güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Renk sınıfını güvenli şekilde oluştur
  const getColorClass = (color: string, isSelected: boolean) => {
    // Önceden tanımlanmış güvenli sınıf adlarını kullan
    const colorClasses = {
      blue: {
        selected: 'bg-blue-500 text-white',
        normal: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      },
      green: {
        selected: 'bg-green-500 text-white',
        normal: 'bg-green-100 text-green-800 hover:bg-green-200',
      },
      red: {
        selected: 'bg-red-500 text-white',
        normal: 'bg-red-100 text-red-800 hover:bg-red-200',
      },
      yellow: {
        selected: 'bg-yellow-500 text-white',
        normal: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      },
      gray: {
        selected: 'bg-gray-500 text-white',
        normal: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      },
      indigo: {
        selected: 'bg-indigo-500 text-white',
        normal: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      },
      purple: {
        selected: 'bg-purple-500 text-white',
        normal: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      },
      pink: {
        selected: 'bg-pink-500 text-white',
        normal: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
      },
      orange: {
        selected: 'bg-orange-500 text-white',
        normal: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      },
    };

    // Güvenli renk kontrolü
    const safeColor = color in colorClasses ? color : 'gray';

    // Seçili duruma göre sınıfları döndür
    return isSelected
      ? colorClasses[safeColor as keyof typeof colorClasses].selected
      : colorClasses[safeColor as keyof typeof colorClasses].normal;
  };

  return (
    <div
      id="cell-edit-modal"
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 hidden"
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            <i className="fas fa-edit mr-2"></i>
            <span id="cell-edit-title">
              {employeeName} - {date}
            </span>
          </h3>
          <button
            id="close-cell-modal"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="border-l-4 border-blue-500 pl-2 py-1 bg-blue-50 rounded text-sm mb-4">
          <div id="cell-edit-info">Düzenlemek için bir seçenek seçin</div>
        </div>

        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Düzenleme Tipi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={setShiftMode}
                className={`px-3 py-2 ${
                  editMode === 'shift' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'
                } font-medium rounded-lg shadow-sm hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors flex items-center justify-center`}
              >
                <i className="far fa-clock mr-2"></i> Vardiya Düzenle
              </button>
              <button
                onClick={setLeaveMode}
                className={`px-3 py-2 ${
                  editMode === 'leave' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'
                } font-medium rounded-lg shadow-sm hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors flex items-center justify-center`}
              >
                <i className="fas fa-user-clock mr-2"></i> İzin Ekle
              </button>
            </div>
          </div>

          {/* Vardiya Düzenleme Bölümü */}
          {editMode === 'shift' && (
            <div id="shift-edit-section">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vardiya Seçimi</label>
              <div className="grid grid-cols-3 gap-2" id="shift-buttons-container">
                {shiftTypes.map((shift) => {
                  const colorStyle = getShiftColorStyle(shift.color, 'shiftTypeSelector');
                  const isSelected = selectedValue === shift.code;

                  return (
                    <button
                      key={shift.code}
                      onClick={() => handleShiftSelect(shift.code)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg shadow-sm focus:outline-none transition-colors flex items-center justify-center`}
                      style={{
                        backgroundColor: isSelected ? colorStyle.color : colorStyle.backgroundColor,
                        color: isSelected ? 'white' : colorStyle.color,
                        border: `1px solid ${colorStyle.color}`,
                      }}
                    >
                      {shift.code}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* İzin Düzenleme Bölümü */}
          {editMode === 'leave' && (
            <div id="leave-edit-section">
              <label className="block text-sm font-medium text-gray-700 mb-2">İzin Tipi</label>
              <select
                id="leave-type-select"
                value={selectedValue}
                onChange={handleLeaveSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              >
                <option value="" disabled>
                  İzin tipini seçin
                </option>
                <option value="YI">Yıllık İzin (Yİ)</option>
                <option value="UI">Ücretsiz İzin (Üİ)</option>
                <option value="R">Rapor (R)</option>
                <option value="MZ">Mazeret İzni (MZ)</option>
                <option value="RT">Resmi Tatil (RT)</option>
              </select>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              id="apply-cell-edit"
              onClick={handleApply}
              disabled={!editMode || !selectedValue}
              className={`px-4 py-2 ${
                editMode && selectedValue
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-300 cursor-not-allowed'
              } text-white font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors mr-2`}
            >
              <i className="fas fa-check mr-2"></i> Uygula
            </button>
            <button
              id="cancel-cell-edit"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors"
            >
              <i className="fas fa-times mr-2"></i> İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
