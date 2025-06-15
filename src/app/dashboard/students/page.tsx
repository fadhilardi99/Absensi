"use client";

import { useState, useEffect, useRef } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { Dialog } from "@headlessui/react";

interface Student {
  id: string;
  name: string;
  class: string;
  gender: string;
  phoneNumber: string;
}

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const classes = ["X IPA 1", "X IPA 2", "X IPA 3", "X IPA 4"];

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  const fetchStudents = async () => {
    try {
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, orderBy("name"));
      const querySnapshot = await getDocs(q);

      const studentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Student[];

      // Filter students by class
      const filteredStudents =
        selectedClass === "all"
          ? studentsData
          : studentsData.filter((student) => student.class === selectedClass);

      setStudents(filteredStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "students", studentId));
      setStudents(students.filter((student) => student.id !== studentId));
      toast.success("Student deleted successfully");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting || !selectedStudent) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name") as string;
      const classValue = formData.get("class") as string;
      const gender = formData.get("gender") as string;
      const phoneNumber = formData.get("phoneNumber") as string;

      // Validate required fields
      if (!name || !classValue || !gender || !phoneNumber) {
        toast.error("Please fill in all required fields");
        return;
      }

      const studentData = {
        name,
        class: classValue,
        gender,
        phoneNumber,
        updatedAt: new Date().toISOString(),
      };

      // Update in Firestore
      await updateDoc(doc(db, "students", selectedStudent.id), studentData);

      // Update local state
      setStudents(
        students.map((student) =>
          student.id === selectedStudent.id
            ? { ...student, ...studentData }
            : student
        )
      );

      // Close modal
      setIsEditModalOpen(false);
      setSelectedStudent(null);

      toast.success("Student updated successfully");
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStudent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name") as string;
      const classValue = formData.get("class") as string;
      const gender = formData.get("gender") as string;
      const phoneNumber = formData.get("phoneNumber") as string;

      // Validate required fields
      if (!name || !classValue || !gender || !phoneNumber) {
        toast.error("Please fill in all required fields");
        return;
      }

      const studentData = {
        name,
        class: classValue,
        gender,
        phoneNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, "students"), studentData);

      // Update local state
      setStudents((prevStudents) => [
        ...prevStudents,
        { id: docRef.id, ...studentData },
      ]);

      // Close modal and reset form
      setIsModalOpen(false);
      if (formRef.current) {
        formRef.current.reset();
      }

      toast.success("Student added successfully");
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedStudent(null);
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Student
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4">
        <div className="max-w-lg">
          <label htmlFor="search" className="sr-only">
            Search students
          </label>
          <div className="relative">
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="max-w-lg">
          <label htmlFor="class-filter" className="sr-only">
            Filter by class
          </label>
          <select
            id="class-filter"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Classes</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
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
                      Gender
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Phone Number
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
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {student.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {student.class}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {student.gender}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {student.phoneNumber}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        className="relative z-50"
      >
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full rounded-xl bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <Dialog.Title className="text-3xl font-semibold text-gray-900">
                Add New Student
              </Dialog.Title>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              ref={formRef}
              onSubmit={handleAddStudent}
              className="space-y-8"
            >
              <div className="grid grid-cols-6 gap-8">
                <div className="col-span-6">
                  <label
                    htmlFor="name"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
                    placeholder="Enter student's full name"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="class"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Class
                  </label>
                  <select
                    name="class"
                    id="class"
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
                  >
                    <option value="">Select class</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="gender"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Gender
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
                    placeholder="Enter student's phone number"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Student"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Edit Student Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full rounded-xl bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <Dialog.Title className="text-3xl font-semibold text-gray-900">
                Edit Student
              </Dialog.Title>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              ref={editFormRef}
              onSubmit={handleUpdateStudent}
              className="space-y-8"
            >
              <div className="grid grid-cols-6 gap-8">
                <div className="col-span-6">
                  <label
                    htmlFor="edit-name"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="edit-name"
                    required
                    defaultValue={selectedStudent?.name}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
                    placeholder="Enter student's full name"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="edit-class"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Class
                  </label>
                  <select
                    name="class"
                    id="edit-class"
                    required
                    defaultValue={selectedStudent?.class}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
                  >
                    <option value="">Select class</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="edit-gender"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Gender
                  </label>
                  <select
                    name="gender"
                    id="edit-gender"
                    required
                    defaultValue={selectedStudent?.gender}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <label
                    htmlFor="edit-phoneNumber"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="edit-phoneNumber"
                    required
                    defaultValue={selectedStudent?.phoneNumber}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
                    placeholder="Enter student's phone number"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Update Student"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
