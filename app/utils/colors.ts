// Tüm renk işlemlerini merkezi bir dosyada toplayıp, her yerde aynı renkleri kullanmamızı sağlayacak

// Renk paletimiz
export const shiftColors = [
  { name: 'blue', hex: '#1e40af', bg: '#eff6ff' },
  { name: 'red', hex: '#b91c1c', bg: '#fef2f2' },
  { name: 'purple', hex: '#7e22ce', bg: '#faf5ff' },
  { name: 'pink', hex: '#be185d', bg: '#fdf2f8' },
  { name: 'yellow', hex: '#a16207', bg: '#fefce8' },
  { name: 'cyan', hex: '#0e7490', bg: '#ecfeff' },
  { name: 'orange', hex: '#c2410c', bg: '#fff7ed' },
  { name: 'lime', hex: '#4d7c0f', bg: '#f7fee7' },
  { name: 'violet', hex: '#6d28d9', bg: '#f5f3ff' },
  { name: 'rose', hex: '#be123c', bg: '#fff1f2' },
  { name: 'sky', hex: '#0369a1', bg: '#f0f9ff' },
  { name: 'amber', hex: '#b45309', bg: '#fffbeb' },
  { name: 'teal', hex: '#0f766e', bg: '#f0fdfa' },
  { name: 'fuchsia', hex: '#a21caf', bg: '#fdf4ff' },
  { name: 'green', hex: '#15803d', bg: '#f0fdf4' },
  { name: 'indigo', hex: '#4338ca', bg: '#eef2ff' },
  { name: 'emerald', hex: '#047857', bg: '#ecfdf5' },
  { name: 'gray', hex: '#374151', bg: '#f9fafb' },
];

// Farklı alanlarda kullanılacak opaklık değerleri
export const opacityValues = {
  shiftTypeSelector: 0.15, // Vardiya tipi seçicisindeki renkler için
  scheduleCell: 0.12, // Çizelgedeki hücrelerdeki renkler için (biraz daha belirgin)
  vardiyaTipleri: 0.05, // Vardiya tipleri bileşenindeki renkler
  tableSummary: 0.08, // Tablo özetindeki vardiya sayıları için (biraz daha belirgin)
};

// Hex renk kodunu açık bir tona dönüştürme fonksiyonu
export function hexToRgba(hex: string, opacity = 0.15): string {
  try {
    // Hex kodu düzenleme (# varsa kaldır)
    let cleanHex = hex.replace('#', '');

    // 3 haneli hex kodunu 6 haneli formata dönüştür (örn: #abc -> #aabbcc)
    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split('')
        .map((char) => char + char)
        .join('');
    }

    // RGB değerlerini hesapla
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // RGBA formatında döndür
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } catch (error) {
    console.error('Geçersiz hex renk kodu:', hex);
    return 'rgba(0, 0, 0, 0.1)'; // Hata durumunda varsayılan renk
  }
}

// Renk ismine göre renk bilgilerini getiren fonksiyon
export function getColorByName(colorName: string) {
  const colorInfo = shiftColors.find((color) => color.name === colorName);

  if (colorInfo) {
    return {
      name: colorInfo.name,
      hex: colorInfo.hex,
      bg: colorInfo.bg,
      // Tailwind sınıfları
      bgClass: `bg-shift-${colorName}`,
      textClass: `text-shift-${colorName}`,
    };
  }

  // Varsayılan olarak gray döndür
  return {
    name: 'gray',
    hex: '#374151',
    bg: '#f9fafb',
    bgClass: 'bg-shift-gray',
    textClass: 'text-shift-gray',
  };
}

// Vardiya tipi için stil oluşturan yardımcı fonksiyon - hangi alanda kullanılacağı belirtilmeli
export function getShiftColorStyle(
  colorName: string,
  styleType:
    | 'shiftTypeSelector'
    | 'scheduleCell'
    | 'vardiyaTipleri'
    | 'tableSummary' = 'scheduleCell',
) {
  // Seçilen stil tipine göre opaklık değeri
  const opacity = opacityValues[styleType];

  // İsme göre renk bilgilerini al
  const colorInfo = shiftColors.find((c) => c.name === colorName);

  // Hex renk kodu kontrolü
  if (colorInfo) {
    // Vardiya tipleri için daha soft arka plan kullan
    if (styleType === 'vardiyaTipleri') {
      return {
        backgroundColor: colorInfo.bg,
        color: colorInfo.hex, // Daire içindeki yazı rengi
        borderColor: colorInfo.hex,
        bgClass: `bg-shift-${colorName}-bg`,
        textClass: `text-shift-${colorName}`,
      };
    }

    // Paletten renk kodunu kullan
    return {
      backgroundColor: hexToRgba(colorInfo.hex, opacity),
      color: colorInfo.hex,
      borderColor: colorInfo.hex,
      // Tailwind sınıfları
      bgClass: `bg-shift-${colorName}`,
      textClass: `text-shift-${colorName}`,
    };
  } else if (colorName && colorName.startsWith('#')) {
    // Doğrudan hex kodu verilmiş
    return {
      backgroundColor: hexToRgba(colorName, opacity),
      color: colorName,
      borderColor: colorName,
      // Özel hex rengi için Tailwind sınıfı yok
      bgClass: '',
      textClass: '',
    };
  }

  // Varsayılan renk (gray)
  const defaultColor = shiftColors.find((c) => c.name === 'gray');
  return {
    backgroundColor:
      styleType === 'vardiyaTipleri'
        ? defaultColor?.bg || '#f9fafb'
        : hexToRgba(defaultColor?.hex || '#374151', opacity),
    color: defaultColor?.hex || '#374151',
    borderColor: defaultColor?.hex || '#374151',
    // Tailwind sınıfları
    bgClass: 'bg-shift-gray',
    textClass: 'text-shift-gray',
  };
}
