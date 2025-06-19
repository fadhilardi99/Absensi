import { NextApiRequest, NextApiResponse } from "next";
import { sendSMS, sendWhatsApp } from "../../lib/twilio";
// import { requireAuth } from '../../lib/auth'; // Uncomment jika ada autentikasi

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Cek autentikasi (optional)
  // const authResult = await requireAuth();
  // if (authResult.error) {
  //   return res.status(authResult.status || 401).json({ error: authResult.error });
  // }

  try {
    const {
      phoneNumber,
      message,
      type = "sms",
      studentName,
      status,
    } = req.body;

    // Validasi input
    if (!phoneNumber || !message) {
      return res.status(400).json({
        error: "Phone number and message are required",
      });
    }

    // Format pesan alert
    const alertMessage = `
🏫 ALERT ABSENSI SEKOLAH

Siswa: ${studentName || "Tidak diketahui"}
Status: ${status || "Tidak diketahui"}
Waktu: ${new Date().toLocaleString("id-ID")}

${message}

Terima kasih.
    `.trim();

    let result;

    if (type === "whatsapp") {
      result = await sendWhatsApp({
        to: phoneNumber,
        message: alertMessage,
      });
    } else {
      result = await sendSMS({
        to: phoneNumber,
        message: alertMessage,
      });
    }

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Alert sent successfully",
        messageSid: result.messageSid,
        status: result.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error: unknown) {
    console.error("Auto alert error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
