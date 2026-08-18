import React, { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, CheckCircleIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  minWidth?: number;
}

// კასტომ, ლამაზად სტილიზებული ჩამოსაშლელი — ბუნებრივი <select>-ის
// ჩამნაცვლებელი იმ ადგილებში, სად ჩამოშლილი სია დიზაინის ნაწილია
// (მაგ. home გვერდის დალაგება/კატეგორია), რადგან ბრაუზერის <select>-ის
// ჩამოშლილ სიას (option-ებს) CSS-ით სრულად ვერ ვმართავთ.
const Dropdown: React.FC<DropdownProps> = ({ value, options, onChange, ariaLabel, minWidth }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <S.DropdownWrap ref={wrapRef} style={minWidth ? { minWidth } : undefined}>
      <S.DropdownButton
        type="button"
        open={open}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
      >
        <S.DropdownButtonLabel>{selected?.label ?? ""}</S.DropdownButtonLabel>
        <S.DropdownChevron open={open}>
          <ChevronDownIcon size={14} />
        </S.DropdownChevron>
      </S.DropdownButton>

      {open && (
        <S.DropdownMenu role="listbox">
          {options.map((opt) => (
            <S.DropdownItem
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              active={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <S.DropdownItemLabel>
                {opt.icon}
                {opt.label}
              </S.DropdownItemLabel>
              {opt.value === value && (
                <S.DropdownCheck>
                  <CheckCircleIcon size={14} />
                </S.DropdownCheck>
              )}
            </S.DropdownItem>
          ))}
        </S.DropdownMenu>
      )}
    </S.DropdownWrap>
  );
};

export default Dropdown;
