import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

// GET: Ambil semua data absensi
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    let q = query(collection(db, "attendance"), orderBy("createdAt", "desc"));
    if (date) {
      q = query(q, where("date", "==", date));
    }
    const querySnapshot = await getDocs(q);
    const attendance = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : data.createdAt,
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate()
            : data.updatedAt,
      };
    });
    return NextResponse.json({ attendance });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

// POST: Tambah absensi baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, status, notes, date, time } = body;
    if (!studentId || !status) {
      return NextResponse.json(
        { error: "Student ID and status are required" },
        { status: 400 }
      );
    }
    // Get student data
    const studentDoc = await getDoc(doc(db, "students", studentId));
    if (!studentDoc.exists()) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const studentData = studentDoc.data();
    const now = new Date();
    const attendanceData = {
      studentId,
      studentName: studentData.name,
      date: date || now.toISOString().split("T")[0],
      time:
        time ||
        now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      status,
      notes: notes || "",
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };
    const docRef = await addDoc(collection(db, "attendance"), attendanceData);
    return NextResponse.json({
      success: true,
      id: docRef.id,
      attendance: {
        id: docRef.id,
        ...attendanceData,
        createdAt: now,
        updatedAt: now,
      },
    });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return NextResponse.json(
      { error: "Failed to create attendance" },
      { status: 500 }
    );
  }
}
