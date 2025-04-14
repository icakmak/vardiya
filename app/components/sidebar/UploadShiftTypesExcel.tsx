'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useSchedule, ShiftType } from '@/app/context/ScheduleContext';
import { shiftColors } from '@/app/utils/colors';

declare global {
  interface Window {
    XLSX: any;
  }
}

interface UploadShiftTypesExcelProps {
  onShiftTypesUploaded?: () => void;
}

export default function UploadShiftTypesExcel({
  onShiftTypesUploaded,
}: UploadShiftTypesExcelProps = {}) {
  const { shiftTypes, setShiftTypes } = useSchedule();
  const [fileName, setFileName] = useState<string>('');
  const [shiftTypesCount, setShiftTypesCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tüm renkleri tanımla - Merkezi renk sisteminden alıyoruz
  const availableColors = shiftColors.map((color) => color.hex);

  // Dengeli renk dağılımı için geliştirilmiş renk seçme fonksiyonu
  const getBalancedColor = (existingShiftTypes: ShiftType[]): string => {
    // Eğer mevcut vardiya tipi yoksa veya çok azsa rastgele bir renk seç
    if (!existingShiftTypes.length || existingShiftTypes.length < 3) {
      return availableColors[Math.floor(Math.random() * availableColors.length)];
    }

    // Mevcut kullanılan renkleri ve sayılarını belirle
    const colorCounts: Record<string, number> = {};

    // Tüm renkleri sıfır ile başlat
    availableColors.forEach((color) => {
      colorCounts[color] = 0;
    });

    // Mevcut vardiya tiplerinin renklerini say
    existingShiftTypes.forEach((shift) => {
      if (shift.color && colorCounts[shift.color] !== undefined) {
        colorCounts[shift.color]++;
      }
    });

    // En az kullanılan renkler listesini oluştur
    let minCount = Number.MAX_SAFE_INTEGER;
    availableColors.forEach((color) => {
      minCount = Math.min(minCount, colorCounts[color]);
    });

    const leastUsedColors = availableColors.filter((color) => colorCounts[color] === minCount);

    // En az kullanılan renklerden birini rastgele seç
    return leastUsedColors[Math.floor(Math.random() * leastUsedColors.length)];
  };

  // Vardiya kodu oluşturma
  const generateShiftCode = (name: string, existingCodes: Set<string>): string => {
    // İsmin ilk harfini al
    let code = name.trim().charAt(0).toUpperCase();

    // Eğer bu kod zaten kullanılıyorsa, ikinci harfi de ekle
    if (existingCodes.has(code) && name.length > 1) {
      code = name.trim().substring(0, 2).toUpperCase();
    }

    // Eğer hala çakışma varsa, sayı ekle
    let counter = 1;
    let tempCode = code;
    while (existingCodes.has(tempCode)) {
      tempCode = code + counter;
      counter++;
    }

    return tempCode;
  };

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
            (!jsonData[0].hasOwnProperty('name') &&
              !jsonData[0].hasOwnProperty('startTime') &&
              !jsonData[0].hasOwnProperty('endTime'))
          ) {
            jsonData = window.XLSX.utils.sheet_to_json(firstSheet, {
              header: ['name', 'startTime', 'endTime'],
            });
          }
        } catch (convertError) {
          console.error('JSON dönüşüm hatası:', convertError);
          // Son çare olarak manuel header ile dene
          jsonData = window.XLSX.utils.sheet_to_json(firstSheet, {
            header: ['name', 'startTime', 'endTime'],
          });
        }

        // Başlık satırını işle - çeşitli formatlara uyum sağla
        if (jsonData.length > 0) {
          // İlk satır kontrolleri
          const firstRow = jsonData[0];
          const keys = Object.keys(firstRow);

          // Eğer ilk satır başlık gibi görünüyorsa (string değerler içeriyorsa)
          if (
            keys.length >= 3 &&
            typeof firstRow[keys[0]] === 'string' &&
            (firstRow[keys[0]].toLowerCase().includes('isim') ||
              firstRow[keys[0]].toLowerCase().includes('vardiya') ||
              firstRow[keys[1]].toLowerCase().includes('başla') ||
              firstRow[keys[2]].toLowerCase().includes('bitiş'))
          ) {
            jsonData.shift(); // Başlık satırını kaldır

            // Eğer başlık satırı vardı ve kolon isimleri farklıysa, veriyi yeniden düzenle
            if (keys[0] !== 'name' || keys[1] !== 'startTime' || keys[2] !== 'endTime') {
              jsonData = jsonData.map((row: any) => ({
                name: row[keys[0]],
                startTime: row[keys[1]],
                endTime: row[keys[2]],
              }));
            }
          }
        }

        // Veri kontrolü
        if (!jsonData || jsonData.length === 0) {
          throw new Error('Excel dosyasında veri bulunamadı veya format uygun değil.');
        }

        // Mevcut varsayılan vardiya tiplerini koru (HT)
        const existingHT = shiftTypes.find((shift) => shift.code === 'HT');
        let newShiftTypes: ShiftType[] = existingHT ? [existingHT] : [];

        // Mevcut vardiya kodlarını takip etmek için set oluştur
        const existingCodes = new Set<string>(shiftTypes.map((shift) => shift.code));

        // Verileri shiftTypes dizisine aktar ve eksik değerleri tamamla
        jsonData.forEach((row: any) => {
          const name = String(row.name || '').trim();
          let startTime = String(row.startTime || '').trim();
          let endTime = String(row.endTime || '').trim();

          // Sadece isim doluysa ekle, başlangıç ve bitiş saatleri zorunlu
          if (name && startTime && endTime) {
            // Saat formatını kontrol et ve düzelt
            if (!/^\d{1,2}:\d{2}$/.test(startTime)) {
              // Eğer sayı ise (8 gibi) saat formatına çevir
              if (!isNaN(Number(startTime))) {
                startTime = `${startTime}:00`;
              }
            }

            if (!/^\d{1,2}:\d{2}$/.test(endTime)) {
              // Eğer sayı ise (17 gibi) saat formatına çevir
              if (!isNaN(Number(endTime))) {
                endTime = `${endTime}:00`;
              }
            }

            // Vardiya kodu üret
            const code = generateShiftCode(name, existingCodes);
            existingCodes.add(code); // Üretilen kodu ekle

            // Dengeli renk ata
            const color = getBalancedColor(newShiftTypes);

            // Vardiya tipini ekle
            newShiftTypes.push({
              code,
              name,
              startTime,
              endTime,
              color,
            });
          }
        });

        if (newShiftTypes.length <= 1) {
          // Sadece HT varsa
          throw new Error(
            'Geçerli vardiya tipi bulunamadı. Lütfen format bilgilerini kontrol edin.',
          );
        }

        // Sayfa sayısını güncelle (yerel state)
        setShiftTypesCount(newShiftTypes.length - (existingHT ? 1 : 0)); // HT haricindeki vardiya tipi sayısı

        // Context'i güncelle
        setShiftTypes(newShiftTypes);
        console.log("Vardiya tipleri context'e yüklendi:", newShiftTypes.length);

        // Başarı mesajı
        console.log(`${newShiftTypes.length - (existingHT ? 1 : 0)} vardiya tipi yüklendi`);

        // Callback'i çağır
        if (onShiftTypesUploaded) {
          onShiftTypesUploaded();
        }
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
            'Dosya formatı beklenenden farklı. Lütfen Vardiya Adı, Başlangıç Saati ve Bitiş Saati içeren bir Excel dosyası yükleyin.',
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
          <i className="fas fa-file-excel mr-2"></i> Vardiya Tipi Yükle
        </h2>
        <div className="tooltip">
          <i className="fas fa-question-circle text-blue-500"></i>
          <span className="tooltiptext">A: Vardiya Adı, B: Başlangıç Saati, C: Bitiş Saati</span>
        </div>
      </div>

      <p className="text-gray-600 mb-2 border-l-4 border-green-500 pl-2 py-1 bg-green-50 rounded text-sm">
        A sütununda Vardiya Adı, B sütununda Başlangıç Saati, C sütununda Bitiş Saati bilgisi
        bulunan Excel dosyasını yükleyin.
      </p>

      <div className="flex items-center w-full">
        <label
          htmlFor="shift-excel-upload"
          className="flex flex-col justify-center items-center w-full h-16 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <div className="flex flex-row gap-2">
            <i className="fas fa-cloud-upload-alt text-3xl text-blue-500"></i>
            <div className="flex flex-col gap-1">
              <p className="mb-1 text-xs text-gray-500">
                <span className="font-semibold">Vardiya Excel'i tıkla/sürükle</span>
              </p>
              <p className="text-xs text-gray-500">.xlsx veya .xls</p>
            </div>
          </div>
          <input
            id="shift-excel-upload"
            type="file"
            className="hidden"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </label>
      </div>

      {shiftTypesCount > 0 && (
        <div className="mt-2 bg-green-100 p-2 rounded-lg border border-green-300 text-sm">
          <div className="flex items-start">
            <i className="fas fa-check-circle text-green-600 mt-1 mr-2"></i>
            <div>
              <p className="text-green-700 font-medium">
                Dosya yüklendi: <span className="font-normal">{fileName}</span>
              </p>
              <p className="text-green-700">
                Vardiya tipi sayısı: <span className="font-semibold">{shiftTypesCount}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
