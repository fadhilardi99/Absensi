import React from "react";
import Image from "next/image";
import { FaUserCheck, FaUserPlus } from "react-icons/fa";
import banner from "@/_assets/school.jpg";

const DashboardPage = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="relative w-full h-64 md:h-80 flex items-center justify-center overflow-hidden rounded-b-3xl shadow-lg">
        <Image
          src={banner}
          alt="Jumbotron"
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-700/70 to-green-400/60 z-10 flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow mb-2 text-center">
            Selamat Datang di Website Absensi
          </h1>
          <p className="text-lg md:text-2xl text-white font-light mb-4">
            Kelola absensi dengan mudah dan efisien
          </p>
        </div>
      </div>
      <div className="w-full max-w-4xl -mt-16 z-20 flex flex-col md:flex-row gap-6 px-4">
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
          <FaUserCheck className="text-green-500 text-5xl mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Kelola Absensi</h2>
          <p className="text-gray-600 mb-4">
            Lihat dan kelola data absensi siswa dengan mudah dan cepat.
          </p>
          <a
            href="/dashboard/attendance"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold transition"
          >
            Lihat Absensi
          </a>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
          <FaUserPlus className="text-blue-500 text-5xl mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Data Siswa</h2>
          <p className="text-gray-600 mb-4">
            Tambah, edit, dan kelola data siswa secara efisien.
          </p>
          <a
            href="/dashboard/students"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-semibold transition"
          >
            Kelola Siswa
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
