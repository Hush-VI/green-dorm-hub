import { getEnv } from "./env.server";

const MNOTIFY_BASE = "https://apps.mnotify.net/smsapi";

export interface SendSmsOptions {
  to: string | string[];
  message: string;
  senderId?: string;
}

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
}

export async function sendSms(opts: SendSmsOptions): Promise<SendSmsResult> {
  const { MNOTIFY_API_KEY: apiKey, MNOTIFY_SENDER_ID: defaultSenderId } = getEnv();

  if (!apiKey) {
    return { success: false, error: "Missing MNOTIFY_API_KEY environment variable." };
  }

  const recipients = Array.isArray(opts.to) ? opts.to.join(",") : opts.to;
  const sender = opts.senderId ?? defaultSenderId;

  const params = new URLSearchParams({
    key: apiKey,
    to: recipients,
    msg: opts.message,
    sender_id: sender,
    schedule_date: "",
    schedule_time: "",
  });

  try {
    const res = await fetch(`${MNOTIFY_BASE}?${params.toString()}`, { method: "GET" });

    if (!res.ok) {
      return { success: false, error: `mNotify HTTP error: ${res.status} ${res.statusText}` };
    }

    const data = (await res.json()) as { status: string; code: string; message_id?: string };

    if (data.status === "success") {
      return { success: true, messageId: data.message_id, status: data.status };
    }

    return { success: false, status: data.status, error: `mNotify error code: ${data.code}` };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error sending SMS" };
  }
}

export async function sendBulkSms(phones: string[], message: string, senderId?: string): Promise<SendSmsResult> {
  if (phones.length === 0) return { success: false, error: "No recipients provided" };
  return sendSms({ to: phones, message, senderId });
}
