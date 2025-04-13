'use client';

import { useEffect, useState } from 'react';

export default function Navbar() {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    setCurrentDate(now.toLocaleDateString('tr-TR', options));
  }, []);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md no-print">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <i className="fas fa-calendar-alt mr-2"></i> Vardiya Çizelgesi Oluşturma
        </h1>
        <div className="text-sm">
          <span id="current-date" className="opacity-75">
            {currentDate}
          </span>
        </div>
      </div>
    </nav>
  );
}
