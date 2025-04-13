'use client';

import { useEffect } from 'react';
import { ScheduleProvider } from '@/app/context/ScheduleContext';
import Navbar from '@/app/components/Navbar';
import Sidebar from '@/app/components/Sidebar';
import MainContent from '@/app/components/MainContent';
import Footer from '@/app/components/Footer';
import ShiftTypeModal from '@/app/components/modals/ShiftTypeModal';
import CellEditModal from '@/app/components/modals/CellEditModal';

export default function Home() {
  useEffect(() => {
    // Ana JS dosyasındaki fonksiyonları çağırmak için useEffect kullanıyoruz
    // Bu kısım daha sonra client componentler içine taşınacak
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    if (document.getElementById('current-date')) {
      document.getElementById('current-date')!.textContent = now.toLocaleDateString(
        'tr-TR',
        options,
      );
    }

    // Durumsuzluk tipleri için toggle fonksiyonu
    const toggleButton = document.getElementById('toggle-durumsuzluk');
    const compactView = document.getElementById('durumsuzluk-compact');
    const detailedView = document.getElementById('durumsuzluk-detailed');

    if (toggleButton && compactView && detailedView) {
      toggleButton.addEventListener('click', function () {
        compactView.classList.toggle('hidden');
        detailedView.classList.toggle('hidden');

        if (detailedView.classList.contains('hidden')) {
          toggleButton.innerHTML =
            '<i class="fas fa-chevron-down" id="durumsuzluk-icon"></i> Detayları Göster';
        } else {
          toggleButton.innerHTML =
            '<i class="fas fa-chevron-up" id="durumsuzluk-icon"></i> Detayları Gizle';
        }
      });
    }
  }, []);

  return (
    <ScheduleProvider key="global-schedule-context">
      <div className="bg-gray-100 min-h-screen">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <Sidebar />
            </div>
            <div className="col-span-12 md:col-span-9">
              <MainContent />
            </div>
          </div>
        </div>

        <Footer />

        {/* Modals */}
        <div id="modals-container">
          <ShiftTypeModal />
          <CellEditModal />
        </div>
      </div>
    </ScheduleProvider>
  );
}
