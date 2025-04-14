'use client';

import { useState, useEffect } from 'react';
import { useSchedule } from '@/app/context/ScheduleContext';
import UploadExcel from './sidebar/UploadExcel';
import ShiftSettings from './sidebar/ShiftSettings';
import LeaveEditor from './sidebar/LeaveEditor';
import ShiftCodes from './sidebar/ShiftCodes';

export default function Sidebar() {
  const { shiftTypes, employees, setSchedule, selectedMonth, selectedYear, setShowSchedule } =
    useSchedule();
  const [showLeaveEditor, setShowLeaveEditor] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [scheduleGenerated, setScheduleGenerated] = useState(false);

  // Adımların tamamlanma durumunu izle
  const [steps, setSteps] = useState([
    {
      id: 1,
      title: 'Çalışan Listesi',
      completed: false,
      description: 'Çalışan Excel dosyasını yükleyin',
    },
    {
      id: 2,
      title: 'Vardiya Tipleri',
      completed: false,
      description: 'Vardiya tiplerini belirleyin',
    },
    {
      id: 3,
      title: 'Çizelge Oluşturma',
      completed: false,
      description: 'Vardiya çizelgesini oluşturun',
    },
  ]);

  // Çalışanlar veya vardiya tipleri yüklendiğinde adımların durumunu güncelle
  useEffect(() => {
    const newSteps = [...steps];

    // Çalışanlar yüklendiyse 1. adım tamamlandı
    if (employees.length > 0) {
      newSteps[0].completed = true;
    }

    // Vardiya tipleri yüklendiyse 2. adım tamamlandı
    if (shiftTypes.length > 0) {
      newSteps[1].completed = true;
    }

    setSteps(newSteps);
  }, [employees, shiftTypes]);

  // Adım değiştirme fonksiyonu
  const goToStep = (stepId: number) => {
    // Önceki adımlar tamamlanmadan sonraki adıma geçilmesini engelle
    if (stepId > 1 && !steps[0].completed) {
      alert('Önce çalışan listesini yüklemelisiniz!');
      return;
    }

    if (stepId > 2 && !steps[1].completed) {
      alert('Önce vardiya tiplerini belirlemelisiniz!');
      return;
    }

    setActiveStep(stepId);
  };

  // Çizelge oluşturmak için fonksiyon
  const generateSchedule = () => {
    // Hata ayıklama için log ekleyelim
    console.log('Çalışan sayısı:', employees?.length);
    console.log('Vardiya Tipleri:', shiftTypes);

    // Çalışan listesi kontrolü
    if (!employees || employees.length === 0) {
      alert('Lütfen önce bir çalışan listesi Excel dosyası yükleyin!');
      return;
    }

    // Vardiya tipleri kontrolü (HT hariç en az bir vardiya tipi olmalı)
    const workShiftTypes = shiftTypes.filter((type) => type.code !== 'HT');
    if (workShiftTypes.length === 0) {
      alert('Lütfen en az bir vardiya tipi ekleyin!');
      return;
    }

    // Boş bir çizelge oluşturalım
    const newSchedule: { [employeeId: string]: (string | null)[] } = {};

    // Her çalışan için boş bir çizelge oluştur
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    employees.forEach((emp) => {
      newSchedule[emp.id] = Array(daysInMonth + 1).fill(null);
    });

    // Vardiyaları adil şekilde dağıt
    distributeShifts(newSchedule, daysInMonth);

    // Schedule'ı güncelle
    setSchedule(newSchedule);

    // Çizelge oluşturulduğunu işaretleyelim
    setScheduleGenerated(true);

    // Çizelgeyi görünür yap
    setShowSchedule(true);

    // Başarılı mesajı gösterme
    alert('Çizelge başarıyla oluşturuldu!');

    // Hata ayıklama için log
    console.log('Çizelge oluşturuldu:', newSchedule);
  };

  // Vardiyaları dağıtma fonksiyonu
  const distributeShifts = (
    schedule: { [employeeId: string]: (string | null)[] },
    daysInMonth: number,
  ) => {
    // Değişkenleri bu satırın dışında tanımlayalım
    const employeeIds = employees.map((emp) => emp.id);

    // Kullanılabilir tüm vardiya tiplerini alalım
    // Vardiya tiplerini context'ten al (A, B, C, vs gibi çalışma vardiyaları)
    // Sadece HT tipini ayır, çünkü o sadece hafta sonu için
    const workShiftTypes = shiftTypes.filter((type) => type.code !== 'HT');
    const vardiyalar = workShiftTypes.map((shift) => shift.code);

    console.log('Dağıtılacak vardiya tipleri:', vardiyalar);

    // Hafta Tatili kodunu bul
    const htVardiya = shiftTypes.find((type) => type.code === 'HT')?.code || 'HT';

    // Hafta içi ve hafta sonu günleri belirleme
    const weekendDays: number[] = [];
    const weekDays: number[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = date.getDay(); // 0: Pazar, 6: Cumartesi

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDays.push(day);
      } else {
        weekDays.push(day);
      }
    }

    // Çalışanları karıştır
    const shuffledEmployees = [...employeeIds].sort(() => 0.5 - Math.random());

    // Vardiya dağıtımı için sayaçlar
    const shiftCounts: Record<string, Record<string, number>> = {};
    employeeIds.forEach((id) => {
      shiftCounts[id] = {};
      vardiyalar.forEach((vardiya) => {
        shiftCounts[id][vardiya] = 0;
      });
      shiftCounts[id].total = 0;
    });

    // Hafta içi günlere çalışma vardiyalarını dağıt
    for (let day of weekDays) {
      // Her vardiya tipini dağıt (tüm çalışma vardiyalarını kullan)
      vardiyalar.forEach((vardiya, vardiyaIndex) => {
        // Her vardiya için çalışanları sıralı dağıt
        let assignedEmployees = 0;

        // Çalışan sayısının vardiya tipine bölünmüş kadarı her vardiya tipinden atama yap
        const targetAssignments = Math.max(1, Math.floor(employeeIds.length / vardiyalar.length));

        // En az vardiya alan çalışanları bul
        const sortedEmployees = [...shuffledEmployees].sort((a, b) => {
          const totalA = shiftCounts[a].total || 0;
          const totalB = shiftCounts[b].total || 0;

          // Aynı sayıda vardiya almışlarsa, bu vardiyayı daha az almış olana öncelik ver
          if (totalA === totalB) {
            return (shiftCounts[a][vardiya] || 0) - (shiftCounts[b][vardiya] || 0);
          }
          return totalA - totalB;
        });

        // Sırayla çalışanlara vardiya ata, hedef sayıya ulaşana kadar
        for (const empId of sortedEmployees) {
          if (assignedEmployees >= targetAssignments) break;

          // Eğer bu gün için zaten vardiya atanmışsa, bu çalışanı atla
          if (schedule[empId][day] !== null) continue;

          // Eğer bu çalışan son 2 günde aynı vardiyayı almadıysa ata
          const lastFewDays = day > 2 ? [day - 1, day - 2] : [day - 1];
          const hasRecentSameShift = lastFewDays.some((prevDay) => {
            return prevDay > 0 && schedule[empId][prevDay] === vardiya;
          });

          // Son 3 günde herhangi bir vardiya almadıysa ata
          const hasConsecutiveShifts =
            day > 3 &&
            schedule[empId][day - 1] !== null &&
            schedule[empId][day - 2] !== null &&
            schedule[empId][day - 3] !== null;

          if (!hasRecentSameShift && !hasConsecutiveShifts) {
            schedule[empId][day] = vardiya;
            shiftCounts[empId][vardiya] = (shiftCounts[empId][vardiya] || 0) + 1;
            shiftCounts[empId].total = (shiftCounts[empId].total || 0) + 1;
            assignedEmployees++;
          }
        }
      });
    }

    // Hafta sonu günlere HT ata (tüm çalışanlara)
    for (let day of weekendDays) {
      employeeIds.forEach((empId) => {
        schedule[empId][day] = htVardiya; // Hafta Tatili sadece hafta sonu
      });
    }

    // Henüz atanmamış günlere vardiya ata (hafta içinde boşluk kalmasın)
    for (let day = 1; day <= daysInMonth; day++) {
      // Hafta sonu ise atla (zaten HT atanmış olmalı)
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // Her çalışan için
      employeeIds.forEach((empId) => {
        // Eğer boşsa ve vardiya atanmamışsa, en uygun vardiyayı ata
        if (schedule[empId][day] === null) {
          // En az vardiya alan vardiya tipini bul
          let minCount = Infinity;
          let selectedVardiya = vardiyalar[0];

          vardiyalar.forEach((vardiya) => {
            const count = shiftCounts[empId][vardiya] || 0;
            if (count < minCount) {
              minCount = count;
              selectedVardiya = vardiya;
            }
          });

          // En az vardiya tipi atanmış olanı seç
          schedule[empId][day] = selectedVardiya;
          shiftCounts[empId][selectedVardiya] = (shiftCounts[empId][selectedVardiya] || 0) + 1;
          shiftCounts[empId].total = (shiftCounts[empId].total || 0) + 1;
        }
      });
    }

    return schedule;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 no-print">
        {/* Adım Göstergeleri */}
        <div className="mb-4">
          <h3 className="text-md font-semibold text-blue-700 mb-2">
            <i className="fas fa-tasks mr-1"></i> Vardiya Planlama Adımları
          </h3>

          <div className="flex flex-col space-y-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`flex items-center p-2 rounded-md transition-all ${
                  activeStep === step.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                } ${step.completed ? 'text-blue-700' : 'text-gray-500'}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : activeStep === step.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.completed ? <i className="fas fa-check"></i> : step.id}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{step.title}</span>
                  <span className="text-xs">{step.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          {/* Adım 1: Çalışan Listesi Yükleme */}
          {activeStep === 1 && (
            <div className="step-1">
              <UploadExcel
                onEmployeesUploaded={() => {
                  // Çalışanlar yüklendiğinde otomatik olarak bir sonraki adıma geç
                  setTimeout(() => {
                    goToStep(2);
                  }, 1000); // Kullanıcının başarı mesajını görmesi için 1 saniye bekle
                }}
              />

              {steps[0].completed && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => goToStep(2)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors flex items-center"
                  >
                    Sonraki Adım <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Adım 2: Vardiya Tipleri */}
          {activeStep === 2 && (
            <div className="step-2">
              <ShiftSettings
                onShiftTypesUploaded={() => {
                  // Vardiya tipleri yüklendiğinde otomatik olarak bir sonraki adıma geç
                  setTimeout(() => {
                    goToStep(3);
                  }, 1000); // Kullanıcının başarı mesajını görmesi için 1 saniye bekle
                }}
              />

              <div className="mt-3 flex justify-between">
                <button
                  onClick={() => goToStep(1)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors flex items-center"
                >
                  <i className="fas fa-arrow-left mr-1"></i> Önceki Adım
                </button>

                {steps[1].completed && (
                  <button
                    onClick={() => goToStep(3)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors flex items-center"
                  >
                    Sonraki Adım <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Adım 3: Çizelge Oluşturma */}
          {activeStep === 3 && (
            <div className="step-3">
              <h3 className="text-md font-semibold text-blue-700 mb-2">
                <i className="fas fa-calendar-check mr-1"></i> Çizelge Oluşturma
              </h3>

              <p className="text-gray-600 mb-3 border-l-4 border-blue-500 pl-2 py-1 bg-blue-50 rounded text-sm">
                Çalışanlar ve vardiya tipleri yüklendi. Şimdi çizelge oluşturabilirsiniz.
              </p>

              <button
                onClick={generateSchedule}
                className="w-full px-3 py-2 bg-rose-500 text-white font-medium rounded-lg shadow-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 transition-colors flex items-center justify-center"
              >
                <i className="fas fa-calendar-check mr-2"></i>
                Vardiya Çizelgesi Oluştur
              </button>

              {scheduleGenerated && (
                <div className="mt-2 bg-green-100 p-2 rounded-lg border border-green-300 text-sm">
                  <div className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-2"></i>
                    <p className="text-green-700">
                      Çizelge başarıyla oluşturuldu! Tablo görünümünden inceleyebilirsiniz.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h3 className="text-md font-semibold text-blue-700 mb-2">
                  <i className="fas fa-user-clock mr-1"></i> İzin Ekleme
                </h3>

                <LeaveEditor
                  showLeaveEditor={showLeaveEditor}
                  setShowLeaveEditor={setShowLeaveEditor}
                  selectedEmployee={selectedEmployee}
                  selectedDate={selectedDate}
                />
              </div>

              <div className="mt-3 flex justify-start">
                <button
                  onClick={() => goToStep(2)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors flex items-center"
                >
                  <i className="fas fa-arrow-left mr-1"></i> Önceki Adım
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-4 no-print">
        <ShiftCodes shiftTypes={shiftTypes} />
      </div>
    </>
  );
}
