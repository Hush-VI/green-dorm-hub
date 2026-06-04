import { getEnv } from "./env.server";

// mNotify Ghana SMS API
// Docs: https://apps.mnotify.net (login → API section)
// Two possible endpoint formats — we try the v2 JSON API first, fall back to query-string API

const MNOTIFY_V2 = "https://apps.mnotify.net/smsapi/v2/sms/quick-sms";
const MNOTIFY_V1 = "https://apps.mnotify.net/smsapi";

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
  raw?: unknown;
}

export async function sendSms(opts: {
  to: string | string[];
  message: string;
  senderId?: string;
}): Promise<SendSmsResult> {
  const { MNOTIFY_API_KEY: apiKey, MNOTIFY_SENDER_ID: defaultSenderId } = getEnv();

  if (!apiKey) {
    return { success: false, error: "Missing MNOTIFY_API_KEY." };
  }

  const recipients = Array.isArray(opts.to) ? opts.to.join(",") : opts.to;
  const sender = opts.senderId ?? defaultSenderId;

  // Try v1 query-string API (most common for mNotify Ghana)
  const params = new URLSearchParams({
    key: apiKey,
    to: recipients,
    msg: opts.message,
    sender_id: sender,
    schedule_date: "",
    schedule_time: "",
  });

  try {
    const res = await fetch(`${MNOTIFY_V1}?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    const text = await res.text();

    // mNotify sometimes returns plain text, sometimes JSON
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      // Plain text response — treat non-empty as success indicator
      if (res.ok) return { success: true, raw: text };
      return { success: false, error: `mNotify error: ${text}` };
    }

    // Check various success indicators mNotify uses
    if (
      data.status === "success" ||
      data.code === "1000" ||
      data.code === "000" ||
      String(data.status) === "1"
    ) {
      return { success: true, messageId: String(data.message_id ?? data.id ?? ""), raw: data };
    }

    return {
      success: false,
      status: String(data.status ?? ""),
      error: `mNotify code: ${data.code ?? data.status} — ${data.message ?? data.msg ?? ""}`,
      raw: data,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error sending SMS",
    };
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
