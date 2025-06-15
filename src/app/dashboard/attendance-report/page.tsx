"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  BarChart2,
  AlertTriangle,
  X,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  status: "present" | "absent" | "late";
  date: string;
  timestamp: Timestamp;
  className: string;
}

interface ClassAttendance {
  className: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

export default function AttendanceReportPage() {
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [classAttendance, setClassAttendance] = useState<ClassAttendance[]>([]);
  const [showNoDataAlert, setShowNoDataAlert] = useState(false);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [selectedDate]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const attendanceRef = collection(db, "attendance");

      // Format date to match the stored format
      const formattedDate = new Date(selectedDate).toISOString().split("T")[0];

      const q = query(attendanceRef, where("date", "==", formattedDate));

      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AttendanceRecord[];

      console.log("Fetched records:", records); // Debug log
      console.log("Selected date:", formattedDate); // Debug log

      setAttendanceRecords(records);

      // Show alert if no data found
      if (records.length === 0) {
        setShowNoDataAlert(true);
      } else {
        setShowNoDataAlert(false);
      }

      // Extract unique classes
      const uniqueClasses = Array.from(
        new Set(records.map((record) => record.className))
      ).filter(Boolean) as string[];

      // Calculate class-wise attendance
      const classData = uniqueClasses.map((className) => {
        const classRecords = records.filter(
          (record) => record.className === className
        );
        const uniqueStudents = new Set(classRecords.map((r) => r.studentId))
          .size;
        const present = classRecords.filter(
          (r) => r.status === "present"
        ).length;
        const absent = classRecords.filter((r) => r.status === "absent").length;
        const late = classRecords.filter((r) => r.status === "late").length;
        const attendanceRate =
          uniqueStudents > 0 ? ((present + late) / uniqueStudents) * 100 : 0;

        return {
          className,
          totalStudents: uniqueStudents,
          present,
          absent,
          late,
          attendanceRate: Number(attendanceRate.toFixed(1)),
        };
      });

      setClassAttendance(classData);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Report</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* No Data Alert */}
      {showNoDataAlert && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Tidak ada data kehadiran untuk tanggal{" "}
                {new Date(selectedDate).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setShowNoDataAlert(false)}
                  className="inline-flex rounded-md bg-yellow-50 p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Only show summary cards and table if there is data */}
      {!showNoDataAlert && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Records
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {attendanceRecords.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <BarChart2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {
                      attendanceRecords.filter((r) => r.status === "present")
                        .length
                    }
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl font-semibold text-red-600">
                    {
                      attendanceRecords.filter((r) => r.status === "absent")
                        .length
                    }
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Late</p>
                  <p className="text-2xl font-semibold text-yellow-600">
                    {
                      attendanceRecords.filter((r) => r.status === "late")
                        .length
                    }
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Class-wise Attendance Summary */}
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Class-wise Attendance Summary
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Class
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total Students
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Present
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Absent
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Late
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Attendance Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classAttendance.map(
                      ({
                        className,
                        totalStudents,
                        present,
                        absent,
                        late,
                        attendanceRate,
                      }) => (
                        <tr
                          key={className}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  Class {className}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100">
                                <Users className="h-4 w-4 text-gray-600" />
                              </div>
                              <span className="ml-2 text-sm font-medium text-gray-900">
                                {totalStudents}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="ml-2 text-sm font-medium text-green-600">
                                {present}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-red-100">
                                <XCircle className="h-4 w-4 text-red-600" />
                              </div>
                              <span className="ml-2 text-sm font-medium text-red-600">
                                {absent}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-yellow-100">
                                <Clock className="h-4 w-4 text-yellow-600" />
                              </div>
                              <span className="ml-2 text-sm font-medium text-yellow-600">
                                {late}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                  style={{ width: `${attendanceRate}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm font-medium text-gray-900">
                                {attendanceRate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
