# 📅 Vardiya Çizelgesi Uygulaması

![Next.js](https://img.shields.io/badge/Next.js-13.0+-000000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-38B2AC?logo=tailwind-css)

Bu uygulama, personel vardiya çizelgesi oluşturmak ve yönetmek için geliştirilmiş bir web uygulamasıdır. Excel entegrasyonu ve kullanıcı dostu arayüzü ile vardiya planlamasını kolaylaştırır.

## 📋 Proje Hakkında

Vardiya Çizelgesi Uygulaması, personel çalışma saatlerini planlamak için geliştirilmiştir. Temel özellikleri:

- Excel dosyasından personel verilerini içe aktarma
- Vardiya tiplerini tanımlama ve özelleştirme
- Otomatik vardiya çizelgesi oluşturma
- Excel ve PDF formatlarında dışa aktarma

## ✨ Mevcut Özellikler

### Veri Yönetimi

- Excel dosyasından çalışan verilerini içe aktarma
- Vardiya tiplerini manuel olarak tanımlama
- Vardiya tiplerini Excel'den içe aktarma seçeneği

### Çizelge Oluşturma

- Adım adım ilerleyen (wizard) arayüz tasarımı
- Otomatik vardiya dağıtım algoritması
- Hafta içi/hafta sonu günleri için farklı vardiya tipleri atayabilme

### Hücre Düzenleme

- Çizelgedeki herhangi bir hücreyi tıklayarak düzenleme
- Vardiya tipini veya izin türünü değiştirebilme
- Renk kodları ile vardiya tiplerini görsel olarak ayırt etme

### Dışa Aktarma

- Excel formatında dışa aktarma (detaylı veriler ve hesaplamalar ile)
- PDF formatında yazdırmaya hazır çizelge alma
- İstatistik ve toplamların otomatik hesaplanması

## 🛠️ Kullanılan Teknolojiler

- **[Next.js](https://nextjs.org/)** - React tabanlı web framework
- **[TypeScript](https://www.typescriptlang.org/)** - Tip güvenlikli JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - CSS framework
- **[XLSX.js](https://github.com/SheetJS/sheetjs)** - Excel dosyaları işleme
- **[FileSaver.js](https://github.com/eligrey/FileSaver.js/)** - Client-side dosya kaydetme
- **[html2canvas](https://html2canvas.hertzen.com/)** - HTML elementlerini canvas'a dönüştürme
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF oluşturma
- **[Font Awesome](https://fontawesome.com/)** - İkon kütüphanesi

## 🚀 Kurulum ve Çalıştırma

1. Repo'yu klonlayın:

```
git clone https://github.com/username/vardiya.git
cd vardiya
```

2. Gerekli paketleri yükleyin:

```
npm install
```

3. Geliştirme sunucusunu başlatın:

```
npm run dev
```

4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın

## 📘 Kullanım Kılavuzu

### 1. Çalışan Excel Dosyasını Yükleme

1. Sidebar'daki "Çalışan Listesi" adımını seçin
2. Excel dosyasını yükleyin (A sütunu: TC No, B sütunu: Ad Soyad)
3. Başarılı yüklemeden sonra otomatik olarak bir sonraki adıma geçilecektir

### 2. Vardiya Tiplerini Tanımlama

1. Mevcut vardiya tiplerini düzenleyebilir veya yeni vardiya tipleri ekleyebilirsiniz
2. Her vardiya tipi için kod, isim, başlangıç saati, bitiş saati ve renk belirleyebilirsiniz
3. Vardiya tipleri Excel'den de yüklenebilir

### 3. Çizelge Oluşturma

1. "Vardiya Çizelgesi Oluştur" butonuna tıklayarak otomatik çizelge oluşturabilirsiniz
2. Oluşturulan çizelge ekranda görüntülenecektir
3. Çizelgedeki herhangi bir hücreyi tıklayarak vardiya değişikliği yapabilirsiniz

### 4. Dışa Aktarma

1. Çizelgeyi Excel veya PDF formatında dışa aktarabilirsiniz
2. Excel formatında daha detaylı analiz ve hesaplamalar bulunur
3. PDF formatı yazdırmaya uygundur

## 🔧 Sorun Giderme

**Çizelge Görünmüyor:**

- Çalışan listesinin ve vardiya tiplerinin yüklü olduğundan emin olun
- "Vardiya Çizelgesi Oluştur" butonuna tıkladıktan sonra çizelge görüntülenecektir

**PDF'e Aktarma Sorunu:**

- Çizelge tablosunun doğru yüklendiğinden emin olun
- Tarayıcınızın güncel olduğundan emin olun

**Excel Yükleme Sorunu:**

- Excel dosyasının doğru formatta olduğunu kontrol edin (A sütunu: TC No, B sütunu: Ad Soyad)
- Dosya uzantısının .xlsx veya .xls olduğundan emin olun

## 🔄 Güncellemeler

### v0.2.0

- Adım adım ilerleme (Wizard) arayüzü eklendi
- PDF'e aktarma sorunları giderildi
- Vardiya butonları için renk desteği eklendi
- Çizelge görünürlük kontrolü iyileştirildi

### v0.1.0

- İlk sürüm - temel vardiya planlama özellikleri
- Excel entegrasyonu
- Otomatik çizelge oluşturma

## 📝 Yapılacaklar

- [ ] Vardiya dağıtım algoritmasının iyileştirilmesi
- [ ] Tatil günleri ve izin kuralları için daha kapsamlı yönetim
- [ ] Kullanıcı hesapları ve yetkilendirme sistemi
- [ ] Mobil uygulama desteği

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
