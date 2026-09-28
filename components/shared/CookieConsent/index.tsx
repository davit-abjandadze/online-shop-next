import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { CloseIcon } from "@/components/ui/RefIcons";
import { useCookieConsent } from "@/context/CookieConsent";
import * as S from "./style";

/**
 * cookie-ებზე თანხმობის მოდალი. პირველი ვიზიტისას ჩნდება, სანამ მომხმარებელი
 * არჩევანს არ გააკეთებს; შემდეგ Footer-ის "cookie-ს პარამეტრები" ბმულით
 * ხელახლა იხსნება. ანალიტიკის (GA4/GTM) სკრიპტები მხოლოდ თანხმობის შემდეგ
 * იტვირთება (იხ. components/shared/Analytics).
 */
const CookieConsent = () => {
  const { t } = useTranslation("common");
  const { consent, ready, settingsOpen, save, closeSettings } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const firstButtonRef = useRef<HTMLButtonElement | null>(null);

  const isFirstVisit = ready && consent === null;
  const visible = isFirstVisit || settingsOpen;

  // გახსნისას მიმდინარე არჩევანით ვავსებთ; Footer-იდან გახსნისას პირდაპირ პარამეტრები
  useEffect(() => {
    if (!visible) return;
    setAnalytics(consent?.analytics ?? false);
    setShowDetails(settingsOpen);
    firstButtonRef.current?.focus();
  }, [visible, settingsOpen, consent]);

  // Escape ხურავს მხოლოდ ხელახლა გახსნილ პარამეტრებს — პირველ ვიზიტზე არჩევანი საჭიროა
  useEffect(() => {
    if (!settingsOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSettings();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [settingsOpen, closeSettings]);

  if (!visible) return null;

  return (
    <S.Dialog role="dialog" aria-modal="false" aria-labelledby="cookie-consent-title">
      <S.Header>
        <S.Title id="cookie-consent-title">{t("cookie-title")}</S.Title>
        {settingsOpen && !isFirstVisit && (
          <S.CloseButton type="button" onClick={closeSettings} aria-label={t("cookie-close-aria")}>
            <CloseIcon size={14} />
          </S.CloseButton>
        )}
      </S.Header>

      <S.Text>
        {t("cookie-text")}{" "}
        <Link href="/privacy-policy">{t("cookie-privacy-link")}</Link>
      </S.Text>

      {showDetails ? (
        <>
          <S.CategoryList>
            <S.CategoryRow as="div">
              <S.CategoryInfo>
                <S.CategoryTitle>{t("cookie-necessary-title")}</S.CategoryTitle>
                <S.CategoryText>{t("cookie-necessary-text")}</S.CategoryText>
              </S.CategoryInfo>
              <S.Switch>
                <input type="checkbox" checked disabled aria-label={t("cookie-necessary-title")} />
                <span />
              </S.Switch>
            </S.CategoryRow>

            <S.CategoryRow>
              <S.CategoryInfo>
                <S.CategoryTitle>{t("cookie-analytics-title")}</S.CategoryTitle>
                <S.CategoryText>{t("cookie-analytics-text")}</S.CategoryText>
              </S.CategoryInfo>
              <S.Switch>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  aria-label={t("cookie-analytics-title")}
                />
                <span />
              </S.Switch>
            </S.CategoryRow>
          </S.CategoryList>

          <S.Actions>
            <S.Button ref={firstButtonRef} type="button" variant="primary" onClick={() => save({ analytics })}>
              {t("cookie-save")}
            </S.Button>
            <S.Button type="button" variant="secondary" onClick={() => save({ analytics: true })}>
              {t("cookie-accept-all")}
            </S.Button>
          </S.Actions>
        </>
      ) : (
        <S.Actions>
          <S.Button ref={firstButtonRef} type="button" variant="primary" onClick={() => save({ analytics: true })}>
            {t("cookie-accept-all")}
          </S.Button>
          {/* უარყოფა მიღებისავით ადვილი უნდა იყოს (GDPR) — იმავე დონის ღილაკი */}
          <S.Button type="button" variant="secondary" onClick={() => save({ analytics: false })}>
            {t("cookie-reject")}
          </S.Button>
          <S.Button type="button" variant="ghost" onClick={() => setShowDetails(true)}>
            {t("cookie-customize")}
          </S.Button>
        </S.Actions>
      )}
    </S.Dialog>
  );
};

export default CookieConsent;
