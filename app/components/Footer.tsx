'use client';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-8 no-print">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>
          &copy; {new Date().getFullYear()} Vardiya Çizelgesi Uygulaması | Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
