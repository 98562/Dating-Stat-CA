import { privacyConfig } from "@/config/privacy";

export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  savedAt: string;
}

export function getDefaultConsentPreferences(): ConsentPreferences {
  return {
    necessary: true,
    analytics: false,
    advertising: false,
    savedAt: new Date().toISOString()
  };
}

export function hasOptionalConsentCategories() {
  return privacyConfig.analyticsEnabled || privacyConfig.advertisingEnabled;
}

export function readConsentPreferences(): ConsentPreferences | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(privacyConfig.storageKey);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;

    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      advertising: Boolean(parsed.advertising),
      savedAt:
        typeof parsed.savedAt === "string" && parsed.savedAt.length
          ? parsed.savedAt
          : new Date().toISOString()
    };
  } catch {
    return null;
  }
}

export function writeConsentPreferences(preferences: ConsentPreferences) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(privacyConfig.storageKey, JSON.stringify(preferences));
}
