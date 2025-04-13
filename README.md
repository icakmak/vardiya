# Vardiya Çizelgesi Uygulaması

Bu uygulama, personel vardiya çizelgesi oluşturmak ve yönetmek için geliştirilmiş bir Next.js projesidir.

## Özellikler

- Excel dosyasından personel verilerini yükleme
- Özelleştirilebilir vardiya tipleri ve süreleri
- Otomatik vardiya çizelgesi oluşturma
- İzin ve tatil günlerini ekleyebilme
- Vardiya dağılımı görselleştirme
- Excel'e aktarma
- Mobil uyumlu tasarım

## Teknolojiler

- [Next.js](https://nextjs.org/) - React tabanlı web framework
- [TypeScript](https://www.typescriptlang.org/) - Tip güvenlikli JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [XLSX.js](https://github.com/SheetJS/sheetjs) - Excel dosyaları için JavaScript kütüphanesi
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - Client-side dosya kaydetme için JavaScript kütüphanesi
- [Font Awesome](https://fontawesome.com/) - İkon kütüphanesi

## Başlangıç

Bu projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

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
