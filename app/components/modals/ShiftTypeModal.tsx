'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useSchedule, ShiftType } from '@/app/context/ScheduleContext';

export default function ShiftTypeModal() {
  const { shiftTypes, setShiftTypes } = useSchedule();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    startTime: '',
    endTime: '',
    color: 'blue',
  });

  // Sayfa yüklendiğinde modal DOM elementini referans olarak al
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const modal = document.getElementById('shift-type-modal');

      // MutationObserver ile DOM değişikliklerini izle
      if (modal) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
              const isHidden = modal.classList.contains('hidden');
              setIsOpen(!isHidden);

              // Modal açıldığında form verilerini sıfırla
              if (!isHidden) {
                setFormData({
                  code: '',
                  name: '',
                  startTime: '',
                  endTime: '',
                  color: 'blue',
                });
              }
            }
          });
        });

        observer.observe(modal, { attributes: true });

        // Cleanup
        return () => observer.disconnect();
      }
    }
  }, []);

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      const modal = document.getElementById('shift-type-modal');
      if (modal) modal.classList.add('hidden');
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validasyon
    if (!formData.code || !formData.name || !formData.startTime || !formData.endTime) {
      alert('Tüm alanları doldurunuz!');
      return;
    }

    // Vardiya kodu zaten var mı kontrol et
    if (shiftTypes.some((shift) => shift.code === formData.code)) {
      alert(`"${formData.code}" kodu zaten kullanılıyor. Farklı bir kod seçin.`);
      return;
    }

    // Yeni vardiya ekle
    const newShift: ShiftType = {
      code: formData.code,
      name: formData.name,
      startTime: formData.startTime,
      endTime: formData.endTime,
      color: formData.color,
    };

    setShiftTypes([...shiftTypes, newShift]);

    // Yeni vardiya eklendiğinde özel bir event tetikleyelim
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('shiftTypeAdded'));
    }

    // Modalı kapat
    handleClose();
  };

  return (
    <div
      id="shift-type-modal"
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 hidden"
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            <i className="fas fa-plus-circle mr-2"></i> Yeni Vardiya Tipi Ekle
          </h3>
          <button
            id="close-shift-modal"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form id="shift-type-form" className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Vardiya Kodu
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="A, B, C, D..."
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Vardiya Adı
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Gündüz, Gece, Öğle..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç Saati
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş Saati
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Renk
            </label>
            <select
              id="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="blue">Mavi</option>
              <option value="indigo">İndigo</option>
              <option value="purple">Mor</option>
              <option value="pink">Pembe</option>
              <option value="red">Kırmızı</option>
              <option value="orange">Turuncu</option>
              <option value="amber">Kehribar</option>
              <option value="yellow">Sarı</option>
              <option value="lime">Limon</option>
              <option value="green">Yeşil</option>
              <option value="teal">Deniz mavisi</option>
              <option value="cyan">Camgöbeği</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              <i className="fas fa-save mr-2"></i> Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
