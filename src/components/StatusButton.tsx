import React, { useState } from "react";

interface StatusButtonProps {
  studentId: string;
  studentName: string;
  phoneNumber: string;

  newStatus: string;
  onStatusChange: (studentId: string, status: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const StatusButton: React.FC<StatusButtonProps> = ({
  studentId,
  studentName,
  phoneNumber,

  newStatus,
  onStatusChange,
  className = "",
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusClick = async () => {
    setIsLoading(true);

    try {
      // Update status terlebih dahulu
      onStatusChange(studentId, newStatus);

      // Kirim alert otomatis untuk status tertentu
      if (["tidak_hadir", "terlambat", "sakit"].includes(newStatus)) {
        await sendAutoAlert();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendAutoAlert = async () => {
    const alertMessages = {
      tidak_hadir: `🚨 PEMBERITAHUAN: ${studentName} TIDAK HADIR ke sekolah hari ini tanpa keterangan. Mohon konfirmasi keadaan anak.`,
      terlambat: `⏰ PEMBERITAHUAN: ${studentName} TERLAMBAT masuk sekolah hari ini. Waktu kedatangan: ${new Date().toLocaleTimeString(
        "id-ID"
      )}.`,
      sakit: `🏥 PEMBERITAHUAN: ${studentName} tidak hadir karena SAKIT hari ini. Semoga lekas sembuh.`,
    };

    try {
      const response = await fetch("/api/send-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          message: alertMessages[newStatus as keyof typeof alertMessages],
          studentName,
          status: newStatus,
          type: "sms", // bisa diganti ke 'whatsapp'
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`Alert sent successfully to ${phoneNumber}`);
        // Optional: tampilkan notifikasi sukses yang tidak mengganggu
      }
    } catch (error) {
      console.error("Failed to send auto alert:", error);
      // Jangan tampilkan error ke user, cukup log saja
    }
  };

  return (
    <button
      onClick={handleStatusClick}
      disabled={isLoading}
      className={`${className} ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};
