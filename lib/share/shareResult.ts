interface NativeShareData {
  title: string;
  text: string;
  url: string;
  files?: File[];
}

export type { NativeShareData };

export type NativeShareOutcome = "shared" | "unsupported" | "cancelled" | "failed";

export async function shareResult(data: NativeShareData): Promise<NativeShareOutcome> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return "unsupported";
  }

  try {
    await navigator.share(data);
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }

    return "failed";
  }
}
