"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
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
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClass, setSelectedClass] = useState("all");
  const [classes, setClasses] = useState<string[]>([]);

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

      // Check if attendance already exists for this student on this date
      const existingRecord = attendanceRecords.find(
        (record) =>
          record.studentId === studentId && record.date === selectedDate
      );

      if (existingRecord) {
        toast.error("Attendance already recorded for this student");
        return;
      }

      const attendanceData = {
        studentId,
        studentName: student.name,
        status,
        date: selectedDate,
        timestamp: Timestamp.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "attendance"), attendanceData);

      // Update local state
      setAttendanceRecords((prevRecords) => [
        ...prevRecords,
        { id: docRef.id, ...attendanceData },
      ]);

      toast.success("Attendance recorded successfully");
    } catch (error) {
      console.error("Error recording attendance:", error);
      toast.error("Failed to record attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAttendanceStatus = (studentId: string) => {
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Attendance</h1>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-gray-500" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Class
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {students.map((student) => {
                    const status = getAttendanceStatus(student.id);
                    return (
                      <tr key={student.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {student.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {student.class}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {status ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                status === "present"
                                  ? "bg-green-100 text-green-800"
                                  : status === "late"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not recorded</span>
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {!status && (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() =>
                                  handleAttendanceSubmit(student.id, "present")
                                }
                                disabled={isSubmitting}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                Present
                              </button>
                              <button
                                onClick={() =>
                                  handleAttendanceSubmit(student.id, "late")
                                }
                                disabled={isSubmitting}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                              >
                                Late
                              </button>
                              <button
                                onClick={() =>
                                  handleAttendanceSubmit(student.id, "absent")
                                }
                                disabled={isSubmitting}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
