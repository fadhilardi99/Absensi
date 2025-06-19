import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  throw new Error("Twilio credentials are not properly configured");
}

const client = twilio(accountSid, authToken);

export interface SendMessageParams {
  to: string;
  message: string;
}

export const sendSMS = async ({ to, message }: SendMessageParams) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    });

    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
    };
  } catch (error: unknown) {
    console.error("Error sending SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const sendWhatsApp = async ({ to, message }: SendMessageParams) => {
  try {
    // Format nomor untuk WhatsApp (harus diawali dengan whatsapp:)
    const whatsappNumber = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const whatsappFrom = `whatsapp:${twilioPhoneNumber}`;

    const result = await client.messages.create({
      body: message,
      from: whatsappFrom,
      to: whatsappNumber,
    });

    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
    };
  } catch (error: unknown) {
    console.error("Error sending WhatsApp:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
