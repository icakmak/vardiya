'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Veri tipleri tanımlamaları
export interface Employee {
  id: string;
  tcNo: string;
  adSoyad: string;
  isActive: boolean;
}

export interface ShiftType {
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface Schedule {
  [employeeId: string]: (string | null)[];
}

export interface ShiftCounts {
  [employeeId: string]: {
    [shiftType: string]: number;
    total: number;
    totalWeekdays: number;
    totalWeekends: number;
    totalHours: number;
  };
}

// Context türü tanımı
interface ScheduleContextType {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  schedule: Schedule;
  setSchedule: (schedule: Schedule) => void;
  shiftTypes: ShiftType[];
  setShiftTypes: (shiftTypes: ShiftType[]) => void;
  shiftCounts: ShiftCounts;
  setShiftCounts: (shiftCounts: ShiftCounts) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  showSchedule: boolean;
  setShowSchedule: (show: boolean) => void;
}

// Dummy noop fonksiyonu
const noop = () => {};

// Context'in varsayılan değeri
const defaultValue: ScheduleContextType = {
  employees: [],
  setEmployees: noop,
  schedule: {},
  setSchedule: noop,
  shiftTypes: [],
  setShiftTypes: noop,
  shiftCounts: {},
  setShiftCounts: noop,
  selectedMonth: new Date().getMonth() + 1,
  setSelectedMonth: noop,
  selectedYear: new Date().getFullYear(),
  setSelectedYear: noop,
  showSchedule: false,
  setShowSchedule: noop,
};

// Context oluşturma
const ScheduleContext = createContext<ScheduleContextType>(defaultValue);

// Provider bileşeni
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedule, setSchedule] = useState<Schedule>({});
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [shiftCounts, setShiftCounts] = useState<ShiftCounts>({});
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // Hata ayıklama için state değişikliklerini izle
  useEffect(() => {
    console.log('Context - Çalışanlar güncellendi:', employees.length);
  }, [employees]);

  useEffect(() => {
    console.log('Context - Çizelge güncellendi:', Object.keys(schedule).length);
  }, [schedule]);

  // Context değerlerini birleştir
  const value: ScheduleContextType = {
    employees,
    setEmployees,
    schedule,
    setSchedule,
    shiftTypes,
    setShiftTypes,
    shiftCounts,
    setShiftCounts,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    showSchedule,
    setShowSchedule,
  };

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

// Hook
export function useSchedule(): ScheduleContextType {
  const context = useContext(ScheduleContext);

  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }

  return context;
}
