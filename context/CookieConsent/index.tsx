import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

// თანხმობის ვერსია — კატეგორიების შეცვლისას (მაგ. მარკეტინგული cookie-ების
// დამატება) გაზარდეთ, რომ მომხმარებელს არჩევანი თავიდან ეკითხოს.
const CONSENT_VERSION = 1;
const COOKIE_NAME = "cookie_consent";
const MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export interface CookieConsentState {
  // აუცილებელი cookie-ები (სესია, ენა, კალათა) ყოველთვის ჩართულია — აქ არ ინახება
  analytics: boolean;
}

interface CookieConsentContextValue {
  // null — მომხმარებელს ჯერ არ აურჩევია (ან cookie ვადაგასული/ძველი ვერსიისაა)
  consent: CookieConsentState | null;
  // cookie-ს წაკითხვა მხოლოდ კლიენტზე ხდება (hydration-ის შეუსაბამობის გარეშე)
  ready: boolean;
  settingsOpen: boolean;
  save: (consent: CookieConsentState) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue>({
  consent: null,
  ready: false,
  settingsOpen: false,
  save: () => {},
  openSettings: () => {},
  closeSettings: () => {},
});

const readConsent = (): CookieConsentState | null => {
  try {
    const raw = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${COOKIE_NAME}=`))
      ?.slice(COOKIE_NAME.length + 1);
    if (!raw) return null;
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (parsed?.v !== CONSENT_VERSION) return null;
    return { analytics: !!parsed.analytics };
  } catch {
    return null;
  }
};

const writeConsent = (consent: CookieConsentState) => {
  const value = encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION, analytics: consent.analytics }));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
};

// Google Analytics-ის cookie-ების (_ga, _ga_XXXX, _gid) წაშლა თანხმობის გაუქმებისას
const removeAnalyticsCookies = () => {
  const hostParts = window.location.hostname.split(".");
  // cookie შეიძლება დაყენებული იყოს როგორც host-ზე, ისე ძირითად დომენზე (.example.ge)
  const domains = ["", ...hostParts.map((_, i) => `.${hostParts.slice(i).join(".")}`).slice(0, -1)];
  document.cookie
    .split("; ")
    .map((part) => part.split("=")[0])
    .filter((name) => name === "_gid" || name === "_gat" || name.startsWith("_ga"))
    .forEach((name) =>
      domains.forEach((domain) => {
        document.cookie = `${name}=; Path=/; Max-Age=0${domain ? `; Domain=${domain}` : ""}`;
      })
    );
};

export const CookieConsentProvider = ({ children }: { children: React.ReactNode }) => {
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
  }, []);

  const save = useCallback(
    (next: CookieConsentState) => {
      const revokedAnalytics = consent?.analytics && !next.analytics;
      writeConsent(next);
      setConsent(next);
      setSettingsOpen(false);
      if (revokedAnalytics) {
        removeAnalyticsCookies();
        // უკვე ჩატვირთული GA/GTM სკრიპტი გვერდის გადატვირთვამდე აგრძელებდა მუშაობას
        window.location.reload();
      }
    },
    [consent]
  );

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  return (
    <CookieConsentContext.Provider value={{ consent, ready, settingsOpen, save, openSettings, closeSettings }}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => useContext(CookieConsentContext);
