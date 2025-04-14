'use client';

import { useState, useEffect, FormEvent } from 'react';
import { FaTimes } from 'react-icons/fa';
import { RiSave3Fill } from 'react-icons/ri';
import { useSchedule, ShiftType } from '@/app/context/ScheduleContext';
import { shiftColors, hexToRgba } from '@/app/utils/colors';

// Color palette for predefined colors - artık merkezi tanımı kullanıyoruz
const colorOptions = shiftColors;

export default function ShiftTypeModal() {
  const { shiftTypes, setShiftTypes } = useSchedule();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    startTime: '',
    endTime: '',
    color: colorOptions[0].name,
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
                // Varsayılan değerlere dön
                resetForm();
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

  // Edit işlemi için modal açıldığında
  useEffect(() => {
    const handleOpenWithData = (e: CustomEvent) => {
      if (e.detail?.shiftType) {
        const shiftType = e.detail.shiftType;
        setFormData({
          code: shiftType.code,
          name: shiftType.name,
          startTime: shiftType.startTime,
          endTime: shiftType.endTime,
          color: shiftType.color,
        });
        setSelectedShiftType(shiftType);
        setEditMode(true);

        // Modalı aç
        const modal = document.getElementById('shift-type-modal');
        if (modal) modal.classList.remove('hidden');
      }
    };

    window.addEventListener('openShiftTypeModal' as any, handleOpenWithData as any);

    return () => {
      window.removeEventListener('openShiftTypeModal' as any, handleOpenWithData as any);
    };
  }, []);

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      startTime: '',
      endTime: '',
      color: colorOptions[0].name,
    });
    setSelectedShiftType(null);
    setEditMode(false);
  };

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      const modal = document.getElementById('shift-type-modal');
      if (modal) modal.classList.add('hidden');
      setIsOpen(false);
      resetForm();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color: string) => {
    setFormData((prev) => ({ ...prev, color }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validasyon
      if (!formData.code || !formData.name || !formData.startTime || !formData.endTime) {
        alert('Tüm alanları doldurunuz!');
        setIsLoading(false);
        return;
      }

      if (editMode && selectedShiftType) {
        // Mevcut vardiyayı güncelle
        const updatedShiftTypes = shiftTypes.map((shift) =>
          shift.code === selectedShiftType.code ? { ...formData } : shift,
        );
        setShiftTypes(updatedShiftTypes);
      } else {
        // Vardiya kodu zaten var mı kontrol et
        if (shiftTypes.some((shift) => shift.code === formData.code)) {
          alert(`"${formData.code}" kodu zaten kullanılıyor. Farklı bir kod seçin.`);
          setIsLoading(false);
          return;
        }

        // Yeni vardiya ekle
        setShiftTypes([...shiftTypes, formData]);

        // Yeni vardiya eklendiğinde özel bir event tetikleyelim
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('shiftTypeAdded'));
        }
      }

      // Modalı kapat
      handleClose();
    } catch (error) {
      console.error('Vardiya işleme hatası:', error);
      alert('Bir hata oluştu!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!selectedShiftType) return;

    // Silme onayı
    if (confirm(`"${selectedShiftType.name}" vardiyasını silmek istediğinize emin misiniz?`)) {
      // Vardiyayı sil
      const filteredShiftTypes = shiftTypes.filter(
        (shift) => shift.code !== selectedShiftType.code,
      );
      setShiftTypes(filteredShiftTypes);
      handleClose();
    }
  };

  return (
    <div
      id="shift-type-modal"
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 hidden"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          disabled={isLoading}
        >
          <FaTimes size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {editMode ? 'Vardiya Türü Düzenle' : 'Yeni Vardiya Türü Ekle'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Kod
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isLoading || editMode} // Düzenleme modunda kod değiştirilemez
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Vardiya Adı
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Başlangıç Saati
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                Bitiş Saati
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Renk</label>
            <div className="grid grid-cols-6 gap-2">
              {colorOptions.map((colorOption) => {
                const isSelected = formData.color === colorOption.name;
                return (
                  <div
                    key={colorOption.name}
                    onClick={() => handleColorSelect(colorOption.name)}
                    className={`w-full aspect-square rounded-md cursor-pointer hover:scale-110 transition-transform flex items-center justify-center ${
                      isSelected ? 'ring-2 ring-offset-2 ring-black' : ''
                    }`}
                    style={{
                      backgroundColor: colorOption.bg,
                    }}
                    aria-label={`Renk seçeneği: ${colorOption.name}`}
                  >
                    <div
                      className="w-5 h-5 rounded-full shadow-sm"
                      style={{ backgroundColor: colorOption.hex }}
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 p-2 rounded border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Seçilen Renk:</span>
                {formData.color && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full shadow-sm border border-gray-300"
                      style={{
                        backgroundColor:
                          colorOptions.find((c) => c.name === formData.color)?.hex || '#374151',
                      }}
                    ></div>
                    <span className="text-sm italic text-gray-600">{formData.color}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            {editMode && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isLoading}
              >
                Sil
              </button>
            )}

            <button
              type="submit"
              className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <RiSave3Fill className="mr-2" size={16} />
              {isLoading ? 'İşleniyor...' : editMode ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
