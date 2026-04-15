interface NativeShareData {
  title: string;
  text: string;
  url: string;
  files?: File[];
}

export function canNativeShare(data: NativeShareData) {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }

  if (typeof navigator.canShare === "function") {
    try {
      return navigator.canShare(data);
    } catch {
      return false;
    }
  }

  return true;
}
