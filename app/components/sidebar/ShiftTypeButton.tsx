'use client';

import { useEffect } from 'react';
import { useSchedule } from '@/app/context/ScheduleContext';

export default function ShiftTypeButton() {
  const { shiftTypes } = useSchedule();

  // Yeni vardiya tipi eklendiğinde, çizelgeyi otomatik olarak güncellemek için event ekleyelim
  useEffect(() => {
    // Modal açma butonu
    const addShiftTypeBtn = document.getElementById('add-shift-type');
    if (addShiftTypeBtn) {
      addShiftTypeBtn.addEventListener('click', () => {
        const modal = document.getElementById('shift-type-modal');
        if (modal) {
          modal.classList.remove('hidden');
        }
      });
    }

    // Vardiya tipi eklendiğinde schedule'ı güncellemek için özel bir event ekleyelim
    const handleShiftTypeAdded = () => {
      console.log('Yeni vardiya tipi eklendi, çizelge güncellenecek');

      // Otomatik olarak bir miktar gecikme ekleyerek state'in güncellenmesini bekleyelim
      setTimeout(() => {
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
          console.log('Çizelge güncelleniyor...');
          searchBtn.click(); // Otomatik olarak çizelge güncelleme butonuna tıkla
        }
      }, 500); // 500ms gecikme
    };

    // Global bir event listener ekleyelim
    if (typeof window !== 'undefined') {
      window.addEventListener('shiftTypeAdded', handleShiftTypeAdded);

      // Cleanup
      return () => {
        window.removeEventListener('shiftTypeAdded', handleShiftTypeAdded);
      };
    }
  }, []);

  return (
    <button
      id="add-shift-type"
      className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
    >
      <i className="fas fa-plus-circle mr-1"></i> Yeni Ekle
    </button>
  );
}
