// mNotify SMS service — server-only.
// Docs: https://apps.mnotify.net/docs/api

const MNOTIFY_BASE = "https://apps.mnotify.net/smsapi";

export interface SendSmsOptions {
  to: string | string[];   // phone number(s), e.g. "0241234567" or ["024...", "026..."]
  message: string;
  senderId?: string;       // defaults to MNOTIFY_SENDER_ID env var
}

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
}

function getMnotifyConfig() {
  const apiKey = process.env.MNOTIFY_API_KEY;
  const senderId = process.env.MNOTIFY_SENDER_ID ?? "SMEHostel";

  if (!apiKey) {
    throw new Error("Missing MNOTIFY_API_KEY environment variable.");
  }

  return { apiKey, senderId };
}

export async function sendSms(opts: SendSmsOptions): Promise<SendSmsResult> {
  const { apiKey, senderId } = getMnotifyConfig();

  const recipients = Array.isArray(opts.to) ? opts.to.join(",") : opts.to;
  const sender = opts.senderId ?? senderId;

  const params = new URLSearchParams({
    key: apiKey,
    to: recipients,
    msg: opts.message,
    sender_id: sender,
    schedule_date: "",
    schedule_time: "",
  });

  try {
    const res = await fetch(`${MNOTIFY_BASE}?${params.toString()}`, {
      method: "GET",
    });

    if (!res.ok) {
      return {
        success: false,
        error: `mNotify HTTP error: ${res.status} ${res.statusText}`,
      };
    }

    const data = (await res.json()) as { status: string; code: string; message_id?: string };

    // mNotify returns status "success" on success
    if (data.status === "success") {
      return { success: true, messageId: data.message_id, status: data.status };
    }

    return { success: false, status: data.status, error: `mNotify error code: ${data.code}` };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error sending SMS",
    };
  }
}

// Convenience: send to multiple numbers and return aggregate result
export async function sendBulkSms(
  phones: string[],
  message: string,
  senderId?: string,
): Promise<SendSmsResult> {
  if (phones.length === 0) {
    return { success: false, error: "No recipients provided" };
  }
  return sendSms({ to: phones, message, senderId });
}
