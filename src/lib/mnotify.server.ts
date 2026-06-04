import { getEnv } from "./env.server";

// mNotify Ghana SMS API
// Endpoint: https://apps.mnotify.net/smsapi?key=KEY&to=NUMBER&msg=MSG&sender_id=SENDERID
// Success response: { "status": "success", "code": "1000" }
// Error codes: 1002=failed, 1003=low credit, 1004=invalid key, 1005=invalid number,
//              1006=invalid sender id (max 11 chars incl. spaces), 1008=empty message

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

  const to = Array.isArray(opts.to) ? opts.to.join(",") : opts.to;
  const sender_id = opts.senderId ?? defaultSenderId;
  const msg = opts.message;

  const url = `https://apps.mnotify.net/smsapi?key=${encodeURIComponent(apiKey)}&to=${encodeURIComponent(to)}&msg=${encodeURIComponent(msg)}&sender_id=${encodeURIComponent(sender_id)}`;

  try {
    const res = await fetch(url, { method: "GET" });
    const text = await res.text();

    let data: Record<string, string>;
    try {
      data = JSON.parse(text);
    } catch {
      // Not JSON — if HTTP 200 treat as success
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
