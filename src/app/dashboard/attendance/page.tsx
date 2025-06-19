"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { Calendar, GraduationCap } from "lucide-react";

interface Student {
  id: string;
  name: string;
  class: string;
  gender: string;
  phoneNumber: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  status: "present" | "absent" | "late";
  date: string;
  timestamp: Timestamp;
  className: string;
}

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedClass, setSelectedClass] = useState("all");
  const [classes, setClasses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedDate = new Date(selectedDate).toISOString().split("T")[0];

  const filteredStudents = useMemo(() => {
    if (!students) return [];

    return students.filter((student) => {
      const isClassMatch =
        selectedClass === "all" || student.class === selectedClass;
      return isClassMatch;
    });
  }, [students, selectedClass]);

  useEffect(() => {
    fetchStudents();
    fetchAttendanceRecords();
  }, [selectedDate, selectedClass]);

  const fetchStudents = async () => {
    try {
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, orderBy("name"));
      const querySnapshot = await getDocs(q);

      const studentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Student[];

      // Get unique classes
      const uniqueClasses = new Set<string>();
      studentsData.forEach((student) => {
        if (student.class) {
          uniqueClasses.add(student.class);
        }
      });
      setClasses(["all", ...Array.from(uniqueClasses).sort()]);

      // Filter students by class
      const filteredStudents =
        selectedClass === "all"
          ? studentsData
          : studentsData.filter((student) => student.class === selectedClass);

      setStudents(filteredStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const attendanceRef = collection(db, "attendance");
      const q = query(
        attendanceRef,
        where("date", ">=", startOfDay.toISOString()),
        where("date", "<=", endOfDay.toISOString()),
        orderBy("date")
      );

      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AttendanceRecord[];

      console.log("Fetched records:", records);
      console.log("Selected date:", formattedDate);

      setAttendanceRecords(records);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      toast.error("Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceSubmit = async (
    studentId: string,
    status: "present" | "absent" | "late"
  ) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const student = students.find((s) => s.id === studentId);
      if (!student) {
        toast.error("Student not found");
        return;
      }

      const existingRecord = attendanceRecords.find(
        (record) =>
          record.studentId === studentId && record.date === selectedDate
      );

      if (existingRecord) {
        // Update existing record
        await updateDoc(doc(db, "attendance", existingRecord.id), {
          status,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new record
        const newRecord: AttendanceRecord = {
          id: "",
          studentId,
          studentName: student.name,
          status,
          date: selectedDate,
          timestamp: Timestamp.fromDate(new Date(selectedDate)),
          className: student.class,
        };

        const docRef = await addDoc(collection(db, "attendance"), newRecord);
        await updateDoc(docRef, { id: docRef.id });
      }

      // Refresh attendance records
      await fetchAttendanceRecords();

      // Tampilkan alert sukses
      toast.success(
        `Status ${student.name} (${status}) berhasil dicatat dan pesan telah dikirim!`
      );
    } catch (error) {
      console.error("Error recording attendance:", error);
      toast.error("Failed to record attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAttendanceStatus = (studentId: string) => {
    if (!selectedDate) return null;
    const record = attendanceRecords.find(
      (record) => record.studentId === studentId && record.date === selectedDate
    );
    return record?.status || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Attendance</h1>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <GraduationCap className="w-5 h-5 text-gray-500" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full sm:w-auto rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className === "all" ? "All Classes" : className}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle px-4 sm:px-6 lg:px-8">
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Nama Siswa
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Kelas
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => {
                    const currentStatus = getAttendanceStatus(student.id);
                    return (
                      <tr
                        key={student.id}
                        className={
                          idx % 2 === 0
                            ? "bg-gray-50 hover:bg-gray-100"
                            : "bg-white hover:bg-gray-100"
                        }
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {student.class}
                        </td>
                        <td className="py-3 px-4">
                          {currentStatus ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                currentStatus === "present"
                                  ? "bg-green-100 text-green-700"
                                  : currentStatus === "late"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : currentStatus === "absent"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {currentStatus === "present" && "✅"}
                              {currentStatus === "late" && "⏰"}
                              {currentStatus === "absent" && "❌"}
                              {typeof currentStatus === "string"
                                ? currentStatus.charAt(0).toUpperCase() +
                                  currentStatus.slice(1)
                                : ""}
                            </span>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                              <button
                                onClick={() =>
                                  handleAttendanceSubmit(student.id, "present")
                                }
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded shadow text-xs font-semibold transition"
                              >
                                Present
                              </button>
                              <button
                                onClick={() =>
                                  handleAttendanceSubmit(student.id, "late")
                                }
                                disabled={isSubmitting}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded shadow text-xs font-semibold transition"
                              >
                                Late
                              </button>
                              <button
                                onClick={() =>
                                  handleAttendanceSubmit(student.id, "absent")
                                }
                                disabled={isSubmitting}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded shadow text-xs font-semibold transition"
                              >
                                Absent
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
