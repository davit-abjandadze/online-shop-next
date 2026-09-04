import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { ChevronDownIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

// `default` — next-translate-routes-ის შიდა ლოკალეა (იხ. next.config.js),
// გადამრთველში მას არ ვაჩვენებთ.
// `icon` — /public/icons-ში დამატებული დროშის სურათია (ge/en/ru.png); ka-ს
// ფაილი ge.png-ია.
const LOCALES: { code: "ka" | "en" | "ru"; label: string; nativeName: string; icon: string }[] = [
  { code: "ka", label: "KA", nativeName: "ქართული", icon: "/icons/ge.png" },
  { code: "en", label: "EN", nativeName: "English", icon: "/icons/en.png" },
  { code: "ru", label: "RU", nativeName: "Русский", icon: "/icons/ru.png" },
];

interface LanguageSwitcherProps {
  // "mobile-inline" — Header-ის ბურგერ-drawer-ის ვარიანტია: დროპდაუნის
  // ნაცვლად დროშები ერთ მწკრივში ჩანს, დაჭერით პირდაპირ გადადის.
  variant?: "header" | "footer" | "mobile-inline";
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = "header" }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const currentLocale = LOCALES.find((l) => l.code === router.locale) ?? LOCALES[0];

  // Close dropdown on outside click — Header-ის პროფილის dropdown-ის იგივე
  // პატერნი, მაგრამ საკუთარი, დამოუკიდებელი state-ით.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (targetLocale: string) => {
    setOpen(false);
    if (targetLocale === router.locale) return;
    // { pathname, query } ფორმა (href-ის ობიექტური ვარიანტი) დინამიური
    // როუტების (მაგ. /products/[id]) მარშრუტიზაციასაც უსაფრთხოდ უმკლავდება —
    // next-translate-routes ავტომატურად გადააწერს asPath-ს ახალ locale-ზე.
    router.push({ pathname: router.pathname, query: router.query }, router.asPath, {
      locale: targetLocale,
    });
  };

  // მობაილის ბურგერ-drawer-ში დროპდაუნის მაგივრად დროშები ერთ მწკრივში
  // პირდაპირ ჩანს — დაჭერაზე უშუალოდ ერთდება ენა, გახსნა-დახურვის state
  // საერთოდ არ სჭირდება (იხ. Header/index.tsx).
  if (variant === "mobile-inline") {
    return (
      <S.InlineRow>
        {LOCALES.map((locale) => (
          <S.InlineFlagButton
            key={locale.code}
            type="button"
            active={locale.code === currentLocale.code}
            onClick={() => handleSelect(locale.code)}
            aria-label={locale.nativeName}
            title={locale.nativeName}
          >
            <S.InlineFlagIcon src={locale.icon} alt={locale.label} />
          </S.InlineFlagButton>
        ))}
      </S.InlineRow>
    );
  }

  return (
    <S.Wrapper ref={wrapperRef}>
      <S.Trigger
        type="button"
        variant={variant}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="ენის შეცვლა"
        title="ენის შეცვლა"
      >
        <S.FlagIcon src={currentLocale.icon} alt={currentLocale.label} />
        <S.TriggerLabel>{currentLocale.label}</S.TriggerLabel>
        <ChevronDownIcon size={14} />
      </S.Trigger>

      {open && (
        <S.DropdownMenu variant={variant}>
          {LOCALES.map((locale) => (
            <S.DropdownItem
              key={locale.code}
              type="button"
              active={locale.code === currentLocale.code}
              onClick={() => handleSelect(locale.code)}
            >
              <S.DropdownItemLeft>
                <S.FlagIcon src={locale.icon} alt={locale.label} />
                {locale.nativeName}
              </S.DropdownItemLeft>
              <span>{locale.label}</span>
            </S.DropdownItem>
          ))}
        </S.DropdownMenu>
      )}
    </S.Wrapper>
  );
};

export default LanguageSwitcher;
