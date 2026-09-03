import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { ChevronDownIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

// `default` — next-translate-routes-ის შიდა ლოკალეა (იხ. next.config.js),
// გადამრთველში მას არ ვაჩვენებთ.
const LOCALES: { code: "ka" | "en" | "ru"; label: string; nativeName: string }[] = [
  { code: "ka", label: "KA", nativeName: "ქართული" },
  { code: "en", label: "EN", nativeName: "English" },
  { code: "ru", label: "RU", nativeName: "Русский" },
];

interface LanguageSwitcherProps {
  variant?: "header" | "footer";
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

  return (
    <S.Wrapper ref={wrapperRef}>
      <S.Trigger
        type="button"
        variant={variant}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="ენის შეცვლა"
        title="ენის შეცვლა"
      >
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
              {locale.nativeName}
              <span>{locale.label}</span>
            </S.DropdownItem>
          ))}
        </S.DropdownMenu>
      )}
    </S.Wrapper>
  );
};

export default LanguageSwitcher;
