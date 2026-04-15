"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";

import { legalLinks } from "@/config/legal";
import { privacyConfig } from "@/config/privacy";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  getDefaultConsentPreferences,
  hasOptionalConsentCategories,
  readConsentPreferences,
  writeConsentPreferences,
  type ConsentPreferences
} from "@/lib/privacy/preferences";

function buildPreferences(
  overrides: Partial<ConsentPreferences> = {}
): ConsentPreferences {
  return {
    ...getDefaultConsentPreferences(),
    ...overrides,
    necessary: true,
    savedAt: new Date().toISOString()
  };
}

export function PrivacyPreferencesControl() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [savedPreferences, setSavedPreferences] = useState<ConsentPreferences | null>(null);
  const [draftPreferences, setDraftPreferences] = useState<ConsentPreferences>(
    getDefaultConsentPreferences()
  );

  const optionalCategoriesEnabled = useMemo(
    () => privacyConfig.consentUiEnabled && hasOptionalConsentCategories(),
    []
  );

  useEffect(() => {
    setHydrated(true);
    const stored = readConsentPreferences();
    if (stored) {
      setSavedPreferences(stored);
      setDraftPreferences(stored);
    }
  }, []);

  if (!privacyConfig.consentUiEnabled || !hydrated) {
    return null;
  }

  const showBanner = !savedPreferences;

  function savePreferences(next: ConsentPreferences) {
    writeConsentPreferences(next);
    setSavedPreferences(next);
    setDraftPreferences(next);
    setOpen(false);
  }

  return (
    <>
      {showBanner ? (
        <div className="fixed inset-x-4 bottom-4 z-50 rounded-[28px] border border-black/10 bg-white/95 p-4 shadow-card backdrop-blur md:left-auto md:right-6 md:max-w-md">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-accent-50 p-2 text-accent-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-900">Privacy preferences</p>
              <p className="mt-1 text-sm text-ink-600">
                Optional tracking stays off unless you choose otherwise. Calculator age ranges
                start at 18.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => savePreferences(buildPreferences({ analytics: false, advertising: false }))}
            >
              Necessary only
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                savePreferences(
                  buildPreferences({
                    analytics: privacyConfig.analyticsEnabled,
                    advertising: privacyConfig.advertisingEnabled
                  })
                )
              }
            >
              Accept all optional
            </Button>
            <Button onClick={() => setOpen(true)}>Manage choices</Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          className="px-0 text-sm text-ink-600"
          onClick={() => setOpen(true)}
        >
          Privacy preferences
        </Button>
        {legalLinks.privacyEmailHref ? (
          <a
            href={legalLinks.privacyEmailHref}
            className="inline-flex items-center rounded-full bg-sand-100 px-3 py-2 text-sm text-ink-700 transition hover:bg-sand-200"
          >
            Privacy contact
          </a>
        ) : null}
      </div>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Privacy preferences"
        description="Necessary items stay on. Optional analytics and advertising remain opt-in."
      >
        <div className="space-y-4">
          {!optionalCategoriesEnabled ? (
            <div className="rounded-3xl border border-black/5 bg-sand-50 p-4 text-sm text-ink-600">
              This site is currently running in necessary-only mode. Optional analytics and
              advertising controls are available here if those categories are ever turned on, but
              they are not active right now.
            </div>
          ) : null}
          {privacyConfig.categories.map((category) => {
            const checked =
              category.key === "necessary"
                ? true
                : draftPreferences[category.key];

            return (
              <div key={category.key} className="rounded-3xl border border-black/5 bg-sand-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink-900">{category.label}</p>
                    <p className="mt-1 text-sm text-ink-600">{category.description}</p>
                  </div>
                  <Switch
                    checked={checked}
                    disabled={category.required}
                    onCheckedChange={(enabled) => {
                      if (category.required) {
                        return;
                      }

                      setDraftPreferences((current) => ({
                        ...current,
                        [category.key]: enabled
                      }));
                    }}
                  />
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => savePreferences(buildPreferences({ analytics: false, advertising: false }))}
            >
              Necessary only
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                setDraftPreferences(
                  buildPreferences({
                    analytics: privacyConfig.analyticsEnabled,
                    advertising: privacyConfig.advertisingEnabled
                  })
                )
              }
            >
              Select all optional
            </Button>
            <Button onClick={() => savePreferences(buildPreferences(draftPreferences))}>
              Save preferences
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
