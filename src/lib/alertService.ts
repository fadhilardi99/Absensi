export interface AlertData {
  studentId: string;
  studentName: string;
  phoneNumber: string;
  status: "hadir" | "tidak_hadir" | "terlambat" | "sakit" | "izin";
  timestamp: Date;
  message?: string;
}

const alertMessages = {
  tidak_hadir: (name: string) =>
    `${name} tidak hadir hari ini tanpa keterangan.`,
  terlambat: (name: string) => `${name} terlambat masuk sekolah.`,
  sakit: (name: string) => `${name} tidak hadir karena sakit.`,
  izin: (name: string) => `${name} tidak hadir karena izin.`,
};

export const alertService = {
  // Kirim alert otomatis berdasarkan status
  async sendAutoAlert(data: AlertData) {
    // Hanya kirim alert untuk status tertentu
    if (!["tidak_hadir", "terlambat", "sakit", "izin"].includes(data.status)) {
      return { success: true, skipped: true };
    }

    try {
      const message =
        data.message ||
        alertMessages[data.status as keyof typeof alertMessages](
          data.studentName
        );

      const response = await fetch("/api/send-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: data.phoneNumber,
          message,
          studentName: data.studentName,
          status: data.status,
          type: "sms", // atau 'whatsapp'
        }),
      });

      return await response.json();
    } catch (error: unknown) {
      console.error("Auto alert error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  // Kirim alert manual
  async sendManualAlert(
    data: AlertData & { customMessage: string; type: "sms" | "whatsapp" }
  ) {
    try {
      const response = await fetch("/api/send-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: data.phoneNumber,
          message: data.customMessage,
          studentName: data.studentName,
          status: data.status,
          type: data.type,
        }),
      });

      return await response.json();
    } catch (error: unknown) {
      console.error("Manual alert error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
