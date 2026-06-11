// Imgur anonymous image upload — runs client-side only.
// The Client ID is public (not a secret) — safe to use in the browser.

export async function uploadToImgur(file: File): Promise<string> {
  const clientId = import.meta.env.VITE_IMGUR_CLIENT_ID;
  if (!clientId) throw new Error("Imgur Client ID not configured.");

  // Resize/compress before uploading if > 2MB
  const formData = new FormData();
  formData.append("image", file);
  formData.append("type", "file");

  const res = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: { Authorization: `Client-ID ${clientId}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Imgur upload failed (${res.status}): ${err}`);
  }

  const json = (await res.json()) as { success: boolean; data: { link: string } };
  if (!json.success) throw new Error("Imgur returned unsuccessful response.");

  return json.data.link; // e.g. https://i.imgur.com/abc123.jpg
}
