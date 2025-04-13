# Vardiya Çizelgesi Uygulaması

![Vardiya Çizelgesi](https://img.shields.io/badge/Vardiya-Çizelgesi-blue)
![Next.js](https://img.shields.io/badge/Next.js-13.0+-000000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)

Bu uygulama, personel vardiya çizelgesi oluşturmak ve yönetmek için geliştirilmiş modern bir web uygulamasıdır. Kullanıcı dostu arayüzü ile vardiya planlamasını kolaylaştırır ve zaman tasarrufu sağlar.

## 📋 İçerik

- [Özellikler](#özellikler)
- [Ekran Görüntüleri](#ekran-görüntüleri)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Geliştirme](#geliştirme)
- [Lisans](#lisans)
- [İletişim](#i̇letişim)

## ✨ Özellikler

- **Excel Entegrasyonu**: Excel dosyasından personel verilerini kolayca içe aktarma
- **Özelleştirilebilir Vardiyalar**: Farklı vardiya tipleri ve süreleri tanımlayabilme
- **Akıllı Planlama**: Otomatik vardiya çizelgesi oluşturma algoritması
- **İzin Yönetimi**: İzin ve tatil günlerini ekleyebilme ve yönetebilme
- **Görselleştirme**: Vardiya dağılımını grafikler ile görselleştirme
- **Dışa Aktarma**: Oluşturulan çizelgeyi Excel formatında dışa aktarma
- **Responsive Tasarım**: Mobil cihazlardan da erişilebilir arayüz

## 📱 Ekran Görüntüleri

_Uygulama tamamlandığında ekran görüntüleri eklenecektir._

## 🛠️ Teknolojiler

- **Frontend**:

  - [Next.js](https://nextjs.org/) - React tabanlı web framework
  - [TypeScript](https://www.typescriptlang.org/) - Tip güvenlikli JavaScript
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
  - [React Query](https://tanstack.com/query/latest) - Veri yönetimi için
  - [Zustand](https://github.com/pmndrs/zustand) - State yönetimi

- **Veri İşleme**:

  - [XLSX.js](https://github.com/SheetJS/sheetjs) - Excel dosyaları için JavaScript kütüphanesi
  - [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - Client-side dosya kaydetme

- **UI Bileşenleri**:
  - [Shadcn UI](https://ui.shadcn.com/) - Modern UI bileşenleri
  - [Font Awesome](https://fontawesome.com/) - İkon kütüphanesi
  - [React Calendar](https://github.com/wojtekmaj/react-calendar) - Takvim bileşeni

## 🚀 Kurulum

Bu projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

### Ön Koşullar

- Node.js (v16 veya üzeri)
- npm veya yarn

### Adımlar

1. Repo'yu klonlayın:

```bash
git clone https://github.com/kullaniciadi/vardiya-cizelgesi.git
cd vardiya-cizelgesi
```

2. Bağımlılıkları yükleyin:

```bash
npm install
# veya
yarn install
```

3. Geliştirme sunucusunu başlatın:

```bash
npm run dev
# veya
yarn dev
```

4. Tarayıcınızda açın: [http://localhost:3000](http://localhost:3000)

## Kullanım

1. Excel dosyasını yükleyin (A sütununda TC No, B sütununda Ad Soyad olmalıdır).
2. Vardiya ayarlarını yapılandırın.
3. "Vardiya Çizelgesi Oluştur" butonuna tıklayın.
4. Çizelge üzerinde gerekli düzenlemeleri yapın.
5. İsterseniz Excel'e aktarın.

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır - ayrıntılar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

Sorularınız için: [eposta@ornek.com](mailto:eposta@ornek.com)
