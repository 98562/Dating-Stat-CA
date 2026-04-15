import type { SharePreviewData } from "@/lib/share/buildSharePreview";
import { canNativeShare } from "@/lib/share/canNativeShare";
import { renderShareCardImageFile } from "@/lib/share/renderShareCardImage";
import { shareResult, type NativeShareOutcome } from "@/lib/share/shareResult";

export type NativeImageShareOutcome = NativeShareOutcome | "file-unsupported";

interface ShareImageOptions {
  title: string;
  text: string;
  url: string;
  filename: string;
  preview: SharePreviewData;
}

function triggerDownload(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function downloadShareImage(options: Pick<ShareImageOptions, "filename" | "preview">) {
  try {
    const file = await renderShareCardImageFile(options.preview, options.filename);
    triggerDownload(file);
    return true;
  } catch {
    return false;
  }
}

export async function shareImage(options: ShareImageOptions): Promise<NativeImageShareOutcome> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return "unsupported";
  }

  try {
    const file = await renderShareCardImageFile(options.preview, options.filename);
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
