// Imgur anonymous image upload — runs client-side only.
// Client ID is public (not a secret) — safe to use in the browser.

const CLIENT_ID =
  (import.meta.env.VITE_IMGUR_CLIENT_ID as string | undefined) ??
  "f121133fedaa48b"; // fallback hardcoded — public value, not a secret

export async function uploadToImgur(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("type", "file");

  const res = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: { Authorization: `Client-ID ${CLIENT_ID}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed (${res.status}): ${err}`);
  }

  const json = (await res.json()) as {
    success: boolean;
    data: { link: string };
  };

  if (!json.success) throw new Error("Imgur returned an unsuccessful response.");

  return json.data.link; // e.g. https://i.imgur.com/abc123.jpg
}
