# 📅 Vardiya Çizelgesi Uygulaması

![Vardiya Çizelgesi](https://img.shields.io/badge/Vardiya-Çizelgesi-blue)
![Next.js](https://img.shields.io/badge/Next.js-13.0+-000000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

Bu uygulama, personel vardiya çizelgesi oluşturmak ve yönetmek için geliştirilmiş modern bir web uygulamasıdır. Kullanıcı dostu arayüzü ile vardiya planlamasını kolaylaştırır ve zaman tasarrufu sağlar. Kurumlar için özelleştirilebilir yapısı sayesinde farklı vardiya sistemlerine uyum sağlayabilir.

<p align="center">
  <img src="public/screenshot-placeholder.png" alt="Vardiya Çizelgesi Uygulaması" width="800"/>
</p>

## 📋 İçerik

- [Proje Hakkında](#-proje-hakkında)
- [Özellikler](#-özellikler)
- [Ekran Görüntüleri](#-ekran-görüntüleri)
- [Demo](#-demo)
- [Teknolojiler](#️-teknolojiler)
- [Sistem Mimarisi](#-sistem-mimarisi)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [API Referansı](#-api-referansı)
- [Veri Modeli](#-veri-modeli)
- [Geliştirme](#-geliştirme)
- [Test](#-test)
- [Dağıtım](#-dağıtım)
- [Yol Haritası](#-yol-haritası)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Sık Sorulan Sorular](#-sık-sorulan-sorular)
- [Lisans](#-lisans)
- [İletişim](#-i̇letişim)
- [Teşekkürler](#-teşekkürler)

## 🚀 Proje Hakkında

Vardiya Çizelgesi Uygulaması, personel yönetiminde karşılaşılan vardiya planlama zorluklarını çözmek için tasarlanmıştır. Özellikle sağlık, güvenlik, üretim ve hizmet sektörlerinde 7/24 çalışan kurumlar için ideal bir çözümdür.

### Neden Bu Proje?

- **Zaman Tasarrufu**: Manuel vardiya planlaması saatler sürerken, uygulamamız saniyeler içinde çizelge oluşturur
- **Adil Dağılım**: Algoritma, vardiyaları personel arasında adil bir şekilde dağıtır
- **Uyumluluk**: Yasal çalışma saatleri ve dinlenme sürelerine uygun planlama yapar
- **Esneklik**: Farklı vardiya modelleri ve özel durumlar için uyarlanabilir

## ✨ Özellikler

### Temel Özellikler

- **Adım Adım İlerleme (Wizard)**: Kullanıcıyı aşama aşama yönlendiren gelişmiş bir arayüz
- **Excel Entegrasyonu**: Excel dosyasından personel verilerini kolayca içe aktarma
- **Özelleştirilebilir Vardiyalar**: Farklı vardiya tipleri ve süreleri tanımlayabilme
- **Akıllı Planlama**: Otomatik vardiya çizelgesi oluşturma algoritması
- **İzin Yönetimi**: İzin ve tatil günlerini ekleyebilme ve yönetebilme
- **Görselleştirme**: Vardiya dağılımını grafikler ile görselleştirme
- **Dışa Aktarma**: Oluşturulan çizelgeyi Excel ve PDF formatlarında dışa aktarma
- **Responsive Tasarım**: Mobil cihazlardan da erişilebilir arayüz

### Gelişmiş Özellikler

- **Wizard Arayüzü**: Kullanımı kolaylaştıran adım adım ilerleme sistemi:
  - 1. Adım: Çalışan Excel dosyasını yükleme
  - 2. Adım: Vardiya tiplerini belirleme/yükleme
  - 3. Adım: Vardiya çizelgesi oluşturma
- **Otomatik Adım Geçişi**: Veri yüklendiğinde otomatik olarak bir sonraki adıma geçme
- **PDF ve Excel Dışa Aktarma**: Çizelgeyi farklı formatlarda kaydedebilme
- **Personel Tercihleri**: Çalışanların tercih ettikleri vardiya saatlerini belirtebilme
- **Çakışma Kontrolü**: Vardiya çakışmalarını otomatik tespit etme ve çözme
- **Yasal Uyumluluk**: Maksimum çalışma saatleri ve minimum dinlenme sürelerini dikkate alma
- **Vardiya Değişimi**: Personel arasında vardiya değişimi yapabilme
- **Bildirimler**: Vardiya değişiklikleri için e-posta/SMS bildirimleri
- **Raporlama**: Vardiya dağılımı, çalışma saatleri ve personel performansı raporları
- **Çoklu Dil Desteği**: Türkçe ve İngilizce arayüz seçenekleri
- **Karanlık/Aydınlık Tema**: Kullanıcı tercihine göre tema değiştirme

## 📱 Ekran Görüntüleri

<div align="center">
  <table>
    <tr>
      <td align="center"><b>Ana Sayfa</b></td>
      <td align="center"><b>Vardiya Planlama</b></td>
    </tr>
    <tr>
      <td><img src="public/screenshot-home.png" alt="Ana Sayfa" width="400"/></td>
      <td><img src="public/screenshot-planning.png" alt="Vardiya Planlama" width="400"/></td>
    </tr>
    <tr>
      <td align="center"><b>Personel Yönetimi</b></td>
      <td align="center"><b>Raporlar</b></td>
    </tr>
    <tr>
      <td><img src="public/screenshot-personnel.png" alt="Personel Yönetimi" width="400"/></td>
      <td><img src="public/screenshot-reports.png" alt="Raporlar" width="400"/></td>
    </tr>
  </table>
</div>

_Not: Uygulama geliştirme aşamasında olduğu için ekran görüntüleri temsilidir ve tamamlandığında güncellenecektir._

## 🌐 Demo

Uygulamanın canlı demosuna [buradan](https://vardiya-demo.vercel.app) erişebilirsiniz.

**Demo Hesabı**:

- **Kullanıcı Adı**: demo@vardiya.com
- **Şifre**: demo123

## 🛠️ Teknolojiler

### Frontend

- **[Next.js](https://nextjs.org/)** - React tabanlı web framework
- **[TypeScript](https://www.typescriptlang.org/)** - Tip güvenlikli JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Query](https://tanstack.com/query/latest)** - Veri yönetimi için
- **[Zustand](https://github.com/pmndrs/zustand)** - State yönetimi
- **[React Hook Form](https://react-hook-form.com/)** - Form yönetimi
- **[Zod](https://github.com/colinhacks/zod)** - Form doğrulama

### Veri İşleme

- **[XLSX.js](https://github.com/SheetJS/sheetjs)** - Excel dosyaları için JavaScript kütüphanesi
- **[FileSaver.js](https://github.com/eligrey/FileSaver.js/)** - Client-side dosya kaydetme
- **[date-fns](https://date-fns.org/)** - Tarih işlemleri için JavaScript kütüphanesi
- **[Chart.js](https://www.chartjs.org/)** - Grafikler için JavaScript kütüphanesi
- **[html2canvas](https://html2canvas.hertzen.com/)** - HTML'i canvas'a dönüştürme (PDF export için)
- **[jsPDF](https://github.com/parallax/jsPDF)** - Client-side PDF oluşturma

### UI Bileşenleri

- **[Shadcn UI](https://ui.shadcn.com/)** - Modern UI bileşenleri
- **[Radix UI](https://www.radix-ui.com/)** - Erişilebilir UI primitives
- **[Font Awesome](https://fontawesome.com/)** - İkon kütüphanesi
- **[React Calendar](https://github.com/wojtekmaj/react-calendar)** - Takvim bileşeni
- **[Framer Motion](https://www.framer.com/motion/)** - Animasyonlar için

### Backend (Opsiyonel)

- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Serverless API
- **[Prisma](https://www.prisma.io/)** - ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Veritabanı
- **[NextAuth.js](https://next-auth.js.org/)** - Kimlik doğrulama

### DevOps

- **[Vercel](https://vercel.com/)** - Hosting ve dağıtım
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD
- **[Jest](https://jestjs.io/)** - Test framework
- **[Cypress](https://www.cypress.io/)** - E2E testleri

## 🏗 Sistem Mimarisi

## 📘 Kullanım

Vardiya Çizelgesi Uygulaması, kullanıcı dostu adım adım (wizard) arayüzü sayesinde kolayca kullanılabilir:

### 1. Çalışan Listesini Yükleme

1. Sidebar'daki "Çalışan Listesi" adımını seçin
2. "Excel'i tıkla/sürükle" alanına A sütununda TC No, B sütununda Ad Soyad bilgisi içeren Excel dosyasını sürükleyin veya tıklayarak seçin
3. Dosya başarıyla yüklendiğinde, otomatik olarak bir sonraki adıma geçilecektir
4. Manuel olarak "Sonraki Adım" butonuna tıklayarak da ilerleyebilirsiniz

### 2. Vardiya Tiplerini Tanımlama

1. "Vardiya Tipleri" adımında, vardiya türlerini tanımlayabilirsiniz
2. Mevcut vardiya tiplerini düzenleyebilir veya "Yeni Ekle" butonuyla yeni vardiyalar ekleyebilirsiniz
3. Excel dosyasından vardiya tiplerini içe aktarmak için "Excel'i tıkla/sürükle" alanını kullanabilirsiniz
4. Vardiya tipleri hazır olduğunda, "Sonraki Adım" butonuna tıklayarak ilerleyin

### 3. Vardiya Çizelgesi Oluşturma

1. "Çizelge Oluşturma" adımında, tüm veriler hazır olduğunda "Vardiya Çizelgesi Oluştur" butonuna tıklayın
2. Sistem otomatik olarak çalışanlar için adil bir vardiya dağılımı oluşturacaktır
3. Oluşturulan çizelge ekranda görüntülenecektir
4. Çizelgeyi düzenlemek için, herhangi bir hücreye tıklayarak vardiya tipini değiştirebilirsiniz
5. "İzin Ekleme" bölümünden çalışanlara izin tanımlayabilirsiniz

### Çizelgeyi Dışa Aktarma

1. Oluşturulan çizelgenin üst kısmında bulunan "Excel'e Aktar" veya "PDF'e Aktar" butonlarını kullanabilirsiniz
2. Excel formatında detaylı veriler ve hesaplamalar ile birlikte çizelgeyi kaydedebilirsiniz
3. PDF formatında yazdırmaya hazır bir çizelge elde edebilirsiniz

### İpuçları

- Wizard adımlarını takip etmek en verimli kullanım şeklidir
- Her adımın tamamlanması, bir sonraki adımın etkinleştirilmesini sağlar
- Yeşil tik işareti, adımın başarıyla tamamlandığını gösterir
- Herhangi bir zamanda önceki adımlara dönüp değişiklik yapabilirsiniz
- Vardiya çizelgesi oluşturulduktan sonra manuel olarak düzenlemeler yapabilirsiniz
- Ayın herhangi bir gününde çalışan ve vardiya tipini değiştirmek için ilgili hücreye tıklayın

## 🔄 Son Güncellemeler

### v0.2.0 (Ekim 2023)

- 📱 Adım adım ilerleme (Wizard) arayüzü eklendi
- 📊 Çizelge oluşturma işlemi iyileştirildi
- 🖨️ PDF ve Excel'e aktarma sorunları giderildi
- 🎨 Vardiya butonları için renk desteği eklendi
- 🔍 Çizelge görünürlük kontrolü iyileştirildi

### v0.1.0 (Eylül 2023)

- 🚀 İlk sürüm yayınlandı
- 📋 Temel vardiya planlama özellikleri
- 📤 Excel entegrasyonu
- 📅 Otomatik çizelge oluşturma

## 🔄 API Referansı

## 🔄 Veri Modeli

## 🔄 Geliştirme

## 🔄 Test

## 🔄 Dağıtım

## 🔄 Yol Haritası

## 🔄 Katkıda Bulunma

## 🔄 Sık Sorulan Sorular

## 🔄 Lisans

## 🔄 İletişim

## 🔄 Teşekkürler
