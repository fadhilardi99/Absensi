export interface Student {
  id: string;
  name: string;
  nis: string;
  class: string;
  gender: "Laki-laki" | "Perempuan";
  address: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  status: "hadir" | "terlambat" | "tidak_hadir";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "teacher";
}

export interface AttendanceFormData {
  studentId: string;
  status: "hadir" | "terlambat" | "tidak_hadir";
  notes?: string;
}
