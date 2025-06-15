import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

// GET: Ambil semua data siswa dari Firestore
export async function GET() {
  try {
    const studentsRef = collection(db, "students");
    const q = query(studentsRef, orderBy("name"));
    const querySnapshot = await getDocs(q);

    const students = querySnapshot.docs.map((doc) => {
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

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// POST: Tambah siswa baru ke Firestore
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      nis,
      class: studentClass,
      gender,
      address,
      phoneNumber,
    } = body;

    if (!name || !nis || !studentClass || !gender || !address || !phoneNumber) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const studentData = {
      name,
      nis,
      class: studentClass,
      gender,
      address,
      phoneNumber,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, "students"), studentData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      student: {
        id: docRef.id,
        ...studentData,
        createdAt: now,
        updatedAt: now,
      },
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
