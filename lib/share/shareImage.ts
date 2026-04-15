import { canNativeShare } from "@/lib/share/canNativeShare";
import { shareResult, type NativeShareOutcome } from "@/lib/share/shareResult";

export type NativeImageShareOutcome =
  | NativeShareOutcome
  | "file-unsupported";

interface ShareImageOptions {
  title: string;
  text: string;
  url: string;
  imageUrl: string;
  filename: string;
}

async function fetchImageFile(imageUrl: string, filename: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error("image-fetch-failed");
  }

  const blob = await response.blob();
  return new File([blob], filename, {
    type: blob.type || "image/png"
  });
}

export async function downloadShareImage(imageUrl: string, filename: string) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("image-fetch-failed");
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    window.open(imageUrl, "_blank", "noopener,noreferrer");
    return false;
  }
}

export async function shareImage(options: ShareImageOptions): Promise<NativeImageShareOutcome> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return "unsupported";
  }

  try {
    const file = await fetchImageFile(options.imageUrl, options.filename);
    const payload = {
      title: options.title,
      text: options.text,
      url: options.url,
      files: [file]
    };

    if (!canNativeShare(payload)) {
      return "file-unsupported";
    }

    return await shareResult(payload);
  } catch {
    return "failed";
  }
}
