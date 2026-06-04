import { getEnv } from "./env.server";

// mNotify Ghana SMS API v2
// POST https://api.mnotify.com/api/sms/quick?key=API_KEY
// Body: { recipient: string[], sender: string, message: string, is_schedule: false, schedule_date: "" }
// Success: { status: "success", code: "1000" }

export interface SendSmsResult {
  success: boolean;
  code?: string;
  error?: string;
}

export async function sendSms(opts: {
  to: string | string[];
  message: string;
  senderId?: string;
}): Promise<SendSmsResult> {
  const { MNOTIFY_API_KEY: apiKey, MNOTIFY_SENDER_ID: defaultSenderId } = getEnv();

  if (!apiKey) return { success: false, error: "Missing MNOTIFY_API_KEY." };

  const recipient = Array.isArray(opts.to) ? opts.to : [opts.to];
  const sender = opts.senderId ?? defaultSenderId;

  const url = `https://api.mnotify.com/api/sms/quick?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient,
        sender,
        message: opts.message,
        is_schedule: false,
        schedule_date: "",
      }),
    });

    const text = await res.text();

    let data: Record<string, string>;
    try {
      data = JSON.parse(text);
    } catch {
      return res.ok
        ? { success: true }
        : { success: false, error: `mNotify HTTP ${res.status}: ${text}` };
    }

    const code = String(data.code ?? "");
    const status = String(data.status ?? "");

    if (code === "1000" || status === "success") {
      return { success: true, code };
    }

    const errorMap: Record<string, string> = {
      "1002": "SMS sending failed (server error)",
      "1003": "Insufficient SMS credit balance",
      "1004": "Invalid API key",
      "1005": "Invalid recipient phone number",
      "1006": "Invalid sender ID (max 11 characters including spaces)",
      "1007": "Message scheduled",
      "1008": "Empty message",
    };

    return {
      success: false,
      code,
      error: errorMap[code] ?? `mNotify error code ${code}: ${status}`,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function sendBulkSms(
  phones: string[],
  message: string,
  senderId?: string,
): Promise<SendSmsResult> {
  if (phones.length === 0) return { success: false, error: "No recipients provided" };
  return sendSms({ to: phones, message, senderId });
}
