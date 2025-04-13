'use client';

import { useState } from 'react';

export default function LeaveTypes() {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-blue-700">
          <i className="fas fa-list-alt mr-2"></i> Durumsuzluk Tipleri
        </h2>
        <button onClick={toggleDetails} className="text-sm text-blue-600 hover:text-blue-800">
          <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'}`} id="durumsuzluk-icon"></i>
          {showDetails ? 'Detayları Gizle' : 'Detayları Göster'}
        </button>
      </div>

      {/* Basit, kompakt görünüm */}
      <div
        className={`grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3 ${showDetails ? 'hidden' : ''}`}
        id="durumsuzluk-compact"
      >
        <div className="flex items-center p-2 bg-green-50 rounded-lg tooltip border border-green-200">
          <div className="w-7 h-7 flex items-center justify-center bg-green-100 border border-green-500 mr-2 rounded font-bold text-green-800">
            RT
          </div>
          <span className="text-xs">Rapor Tatil</span>
          <span className="tooltiptext text-xs">
            Tam gün çalışma kabul edilir. Ücretli izin olarak değerlendirilir.
          </span>
        </div>
        <div className="flex items-center p-2 bg-green-50 rounded-lg tooltip border border-green-200">
          <div className="w-7 h-7 flex items-center justify-center bg-green-100 border border-green-500 mr-2 rounded font-bold text-green-800">
            Yİ
          </div>
          <span className="text-xs">Yıllık İzin</span>
          <span className="tooltiptext text-xs">
            Tam gün çalışma kabul edilir. Ücretli izin olarak değerlendirilir.
          </span>
        </div>
        <div className="flex items-center p-2 bg-green-50 rounded-lg tooltip border border-green-200">
          <div className="w-7 h-7 flex items-center justify-center bg-green-100 border border-green-500 mr-2 rounded font-bold text-green-800">
            MZ
          </div>
          <span className="text-xs">Mazeret İzni</span>
          <span className="tooltiptext text-xs">
            Tam gün çalışma kabul edilir. Ücretli izin olarak değerlendirilir.
          </span>
        </div>
        <div className="flex items-center p-2 bg-green-50 rounded-lg tooltip border border-green-200">
          <div className="w-7 h-7 flex items-center justify-center bg-green-100 border border-green-500 mr-2 rounded font-bold text-green-800">
            R
          </div>
          <span className="text-xs">Rapor</span>
          <span className="tooltiptext text-xs">
            Çalışma olmayan (izin) günüdür. Ücretli izin olarak değerlendirilir.
          </span>
        </div>
        <div className="flex items-center p-2 bg-yellow-50 rounded-lg tooltip border border-yellow-200">
          <div className="w-7 h-7 flex items-center justify-center bg-yellow-100 border border-yellow-500 mr-2 rounded font-bold text-yellow-800">
            HT
          </div>
          <span className="text-xs">Hafta Tatili</span>
          <span className="tooltiptext text-xs">Çalışmalar "mesai" olarak değerlendirilir.</span>
        </div>
        <div className="flex items-center p-2 bg-red-50 rounded-lg tooltip border border-red-200">
          <div className="w-7 h-7 flex items-center justify-center bg-red-100 border border-red-500 mr-2 rounded font-bold text-red-800">
            Üİ
          </div>
          <span className="text-xs">Ücretsiz İzin</span>
          <span className="tooltiptext text-xs">
            Çalışma kabul edilmez ve ücretli izin olarak değerlendirilmez.
          </span>
        </div>
      </div>

      {/* Detaylı tablo görünümü */}
      <div className={`overflow-x-auto ${showDetails ? '' : 'hidden'}`} id="durumsuzluk-detailed">
        <table className="min-w-full bg-white border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
              <th className="py-2 px-3 border-b border-r text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Durumsuzluk Tipi
              </th>
              <th className="py-2 px-3 border-b border-r text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Kodu
              </th>
              <th className="py-2 px-3 border-b border-r text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Renk
              </th>
              <th className="py-2 px-3 border-b border-r text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Hesaplamalarda yeri
              </th>
              <th className="py-2 px-3 border-b border-r text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Açıklama
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="py-2 px-3 border-b border-r">Rapor Tatil</td>
              <td className="py-2 px-3 border-b border-r">RT</td>
              <td className="py-2 px-3 border-b border-r bg-green-100">Yeşil</td>
              <td className="py-2 px-3 border-b border-r">Ücretli İzinler</td>
              <td className="py-2 px-3 border-b border-r">
                Bu izne ait belirtilen günler, tam gün çalışma kabul edilir ve ücretli izin olarak
                değerlendirilir.
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2 px-3 border-b border-r">Yıllık İzin</td>
              <td className="py-2 px-3 border-b border-r">Yİ</td>
              <td className="py-2 px-3 border-b border-r bg-green-100">Yeşil</td>
              <td className="py-2 px-3 border-b border-r">Ücretli İzinler</td>
              <td className="py-2 px-3 border-b border-r">
                Bu izne ait belirtilen günler, tam gün çalışma kabul edilir ve ücretli izin olarak
                değerlendirilir.
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2 px-3 border-b border-r">Mazeret ve Diğer İz.</td>
              <td className="py-2 px-3 border-b border-r">MZ</td>
              <td className="py-2 px-3 border-b border-r bg-green-100">Yeşil</td>
              <td className="py-2 px-3 border-b border-r">Ücretli İzinler</td>
              <td className="py-2 px-3 border-b border-r">
                Bu izne ait belirtilen günler, tam gün çalışma kabul edilir ve ücretli izin olarak
                değerlendirilir.
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2 px-3 border-b border-r">Rapor</td>
              <td className="py-2 px-3 border-b border-r">R</td>
              <td className="py-2 px-3 border-b border-r bg-green-100">Yeşil</td>
              <td className="py-2 px-3 border-b border-r">Ücretli İzinler</td>
              <td className="py-2 px-3 border-b border-r">
                Bu izne ait belirtilen günler, çalışma olmayan (izin) günüdür ve ücretli izin olarak
                değerlendirilir.
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2 px-3 border-b border-r">Hafta Tatili</td>
              <td className="py-2 px-3 border-b border-r">HT</td>
              <td className="py-2 px-3 border-b border-r bg-yellow-100">Sarı</td>
              <td className="py-2 px-3 border-b border-r">Hafta sonu Hesaplamaları</td>
              <td className="py-2 px-3 border-b border-r">
                Bu izne ait belirtilen günlerde; çalışmalar "mesai" olarak değerlendirilir.
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2 px-3 border-b border-r">Ücretsiz İzin</td>
              <td className="py-2 px-3 border-b border-r">Üİ</td>
              <td className="py-2 px-3 border-b border-r bg-red-100">Kırmızı</td>
              <td className="py-2 px-3 border-b border-r">Ücretsiz İzin</td>
              <td className="py-2 px-3 border-b border-r">
                Bu izne ait belirtilen günlerde; çalışma kabul edilmez ve ücretli izin olarak
                değerlendirilmez.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
