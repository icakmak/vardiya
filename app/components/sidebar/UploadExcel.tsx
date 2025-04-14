'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useSchedule } from '@/app/context/ScheduleContext';
import { Employee } from '@/app/context/ScheduleContext';

declare global {
  interface Window {
    XLSX: any;
  }
}

// Props tanımı
interface UploadExcelProps {
  onEmployeesUploaded?: () => void;
}

export default function UploadExcel({ onEmployeesUploaded }: UploadExcelProps = {}) {
  const { setEmployees } = useSchedule();
  const [fileName, setFileName] = useState<string>('');
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya türü kontrolü
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'xlsx' && fileType !== 'xls') {
      alert('Lütfen geçerli bir Excel dosyası yükleyin (.xlsx veya .xls)');
      return;
    }

    setFileName(file.name);

    // XLSX kütüphanesinin yüklendiğinden emin olmak için kontrol ekleyelim
    if (typeof window !== 'undefined' && !window.XLSX) {
      console.warn('XLSX kütüphanesi henüz yüklenmedi, 2 saniye bekliyor...');
      // Kütüphane yüklenene kadar bekleyelim
      setTimeout(() => {
        if (!window.XLSX) {
          alert('XLSX kütüphanesi yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.');
          console.error('XLSX kütüphanesi 2 saniye beklemeye rağmen yüklenemedi');
          return;
        }
        // Kütüphane yüklendiğinde dosya okuma işlemini tekrar başlat
        processExcelFile(file);
      }, 2000);
    } else {
      // Kütüphane zaten yüklüyse hemen işleme başla
      processExcelFile(file);
    }
  };

  // Excel dosyasını işleyecek fonksiyon - kütüphane kontrolünü ayrı metoda taşıdık
  const processExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          throw new Error('Dosya okunamadı');
        }

        const data = new Uint8Array(e.target.result as ArrayBuffer);

        if (!window.XLSX) {
          throw new Error('XLSX kütüphanesi yüklenemedi');
        }

        const workbook = window.XLSX.read(data, { type: 'array' });

        // İlk çalışma sayfasını al
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error('Excel dosyasında çalışma sayfası bulunamadı.');
        }

        const firstSheet = workbook.Sheets[sheetName];
        if (!firstSheet) {
          throw new Error('Excel dosyasında veri bulunamadı.');
        }

        // JSON'a dönüştür - başlık satırı olmayan dosyalar için header tanımlama
        let jsonData;
        try {
          // Önce sheet_to_json'u olduğu gibi deneyelim
          jsonData = window.XLSX.utils.sheet_to_json(firstSheet);

          // Eğer sonuç boş veya beklenen kolonlar yoksa, header belirterek deneyelim
          if (
            jsonData.length === 0 ||
            (!jsonData[0].hasOwnProperty('tcNo') && !jsonData[0].hasOwnProperty('adSoyad'))
          ) {
            jsonData = window.XLSX.utils.sheet_to_json(firstSheet, { header: ['tcNo', 'adSoyad'] });
          }
        } catch (convertError) {
          console.error('JSON dönüşüm hatası:', convertError);
          // Son çare olarak manuel header ile dene
          jsonData = window.XLSX.utils.sheet_to_json(firstSheet, { header: ['tcNo', 'adSoyad'] });
        }

        // Başlık satırını işle - çeşitli formatlara uyum sağla
        if (jsonData.length > 0) {
          // İlk satır kontrolleri
          const firstRow = jsonData[0];
          const keys = Object.keys(firstRow);

          // Eğer ilk satır başlık gibi görünüyorsa (string değerler içeriyorsa)
          if (
            keys.length >= 2 &&
            typeof firstRow[keys[0]] === 'string' &&
            (firstRow[keys[0]].toLowerCase().includes('tc') ||
              firstRow[keys[0]].toLowerCase().includes('sicil') ||
              firstRow[keys[0]].toLowerCase().includes('no') ||
              firstRow[keys[1]].toLowerCase().includes('ad') ||
              firstRow[keys[1]].toLowerCase().includes('isim') ||
              firstRow[keys[1]].toLowerCase().includes('personel'))
          ) {
            jsonData.shift(); // Başlık satırını kaldır

            // Eğer başlık satırı vardı ve kolon isimleri farklıysa, veriyi yeniden düzenle
            if (keys[0] !== 'tcNo' || keys[1] !== 'adSoyad') {
              jsonData = jsonData.map((row: any) => ({
                tcNo: row[keys[0]],
                adSoyad: row[keys[1]],
              }));
            }
          }
        }

        // Veri kontrolü
        if (!jsonData || jsonData.length === 0) {
          throw new Error('Excel dosyasında veri bulunamadı veya format uygun değil.');
        }

        // Verileri employees dizisine aktar ve ID ekle
        const employeeList: Employee[] = [];
        jsonData.forEach((row: any) => {
          const tcNo = row.tcNo?.toString() || '';
          const adSoyad = row.adSoyad?.toString() || '';

          if (tcNo && adSoyad) {
            employeeList.push({
              id: tcNo,
              tcNo: tcNo,
              adSoyad: adSoyad,
              isActive: true,
            });
          }
        });

        if (employeeList.length === 0) {
          throw new Error('Çalışan listesi oluşturulamadı');
        }

        // Sayfa sayısını güncelle (yerel state)
        setEmployeeCount(employeeList.length);

        // Context güncellemesi için setTimeout kullanarak async yapıyoruz
        setTimeout(() => {
          // Çalışanları global state'e aktar
          setEmployees(employeeList);
          console.log("Çalışanlar context'e yüklendi:", employeeList.length);

          // Callback'i çağır
          if (onEmployeesUploaded) {
            onEmployeesUploaded();
          }
        }, 0);

        // Başarı mesajı
        console.log(`${employeeList.length} personel yüklendi`);
      } catch (error: any) {
        console.error('Excel dosyası işlenirken hata:', error);
        alert(
          `Excel dosyası işlenirken bir hata oluştu: ${
            error.message || 'Dosya formatını kontrol edin.'
          }`,
        );

        // Hata detayını kullanıcıya göster
        if (error.name === 'TypeError') {
          alert(
            'Dosya formatı beklenenden farklı. Lütfen TC No ve Ad Soyad içeren bir Excel dosyası yükleyin.',
          );
        } else if (error.message.includes('veri bulunamadı')) {
          alert('Excel dosyasında veri bulunamadı. Lütfen dosyanın boş olmadığından emin olun.');
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <div className="flex justify-between mb-2">
        <h2 className="text-lg font-semibold text-blue-700">
          <i className="fas fa-file-excel mr-2"></i> Excel Yükle
        </h2>
        <div className="tooltip">
          <i className="fas fa-question-circle text-blue-500"></i>
          <span className="tooltiptext">
            A sütununda TC No, B sütununda Ad Soyad bilgisi olmalıdır
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-2 border-l-4 border-green-500 pl-2 py-1 bg-green-50 rounded text-sm">
        A sütununda TC No, B sütununda Ad Soyad bilgisi bulunan Excel dosyasını yükleyin.
        <br />
        <span className="mt-1 text-xs italic">
          Not: Vardiya tiplerini ayrı bir Excel ile yüklemek için Vardiya Ayarları bölümüne gidin.
        </span>
      </p>

      <div className="flex items-center w-full">
        <label
          htmlFor="excel-upload"
          className="flex flex-col justify-center items-center w-full h-16 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <div className="flex flex-row gap-2">
            <i className="fas fa-cloud-upload-alt text-3xl text-blue-500"></i>
            <div className="flex flex-col gap-1">
              <p className="mb-1 text-xs text-gray-500">
                <span className="font-semibold">Excel'i tıkla/sürükle</span>
              </p>
              <p className="text-xs text-gray-500">.xlsx veya .xls</p>
            </div>
          </div>
          <input
            id="excel-upload"
            type="file"
            className="hidden"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </label>
      </div>

      {employeeCount > 0 && (
        <div className="mt-2 bg-green-100 p-2 rounded-lg border border-green-300 text-sm">
          <div className="flex items-start">
            <i className="fas fa-check-circle text-green-600 mt-1 mr-2"></i>
            <div>
              <p className="text-green-700 font-medium">
                Dosya yüklendi: <span className="font-normal">{fileName}</span>
              </p>
              <p className="text-green-700">
                Personel sayısı: <span className="font-semibold">{employeeCount}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
