import styled, { css } from "styled-components";

/* ---------- ჰედერის ქვემოთ კატეგორიების დროპდაუნ-ზოლი — მთავარი გვერდის
   იმავე ვიზუალითა და ქცევით (იხ. components/pages/home/style.ts) ---------- */

// `layout="vertical"` — Header-ის მობაილის ბურგერ-drawer-ში გამოსაყენებელი
// ვარიანტია: ჰორიზონტალური სქროლის მაგივრად კატეგორიები ქვევით ეწერება,
// dropdown-პანელიც ცალკე ბუშტის ნაცვლად ტრიგერის ქვემოთ ინლაინში იშლება
// (იხ. components/shared/Header S.MobileMenuFilterWrapper).
type Layout = "horizontal" | "vertical";

export const CategoryFilterBar = styled("div")<{ layout?: Layout }>`
  position: relative;
  z-index: 5;
  background: var(--ref-bg-elevated);
  border-bottom: 1px solid var(--ref-border-soft);

  ${({ layout }) =>
    layout === "vertical" &&
    css`
      background: none;
      border-bottom: none;
    `}

  /* 960px-ზე დაბლა ჰორიზონტალური ზოლი Header-ის ბურგერ მენიუშია გატანილი
     (იხ. components/shared/Header) — გვერდზე ცალკე დუბლირებული აღარ ჩანს.
     ვერტიკალურ ვარიანტს, რომელიც სწორედ ბურგერის drawer-შია ჩასმული, ეს
     წესი არ ეხება. */
  @media (max-width: 960px) {
    ${({ layout }) => layout !== "vertical" && css`display: none;`}
  }
`;

export const CategoryFilterBarInner = styled("div")<{ layout?: Layout }>`
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 900px) {
    padding: 0 16px;
    /* ვიწრო ეკრანებზე კატეგორიების row-ი ეკრანს აღარ ავრცელებს ჰორიზონტალურად —
       სანაცვლოდ თავად ხდება სქროლადი (იგივე პატერნი, რაც home page-ის
       ScrollRow-ს აქვს, იხ. components/pages/home/style.ts) */
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  ${({ layout }) =>
    layout === "vertical" &&
    css`
      flex-direction: column;
      align-items: stretch;
      max-width: none;
      margin: 0;
      padding: 0;
      gap: 2px;

      @media (max-width: 900px) {
        padding: 0;
        overflow-x: visible;
      }
    `}
`;

export const FilterDropdown = styled("div")<{ layout?: Layout }>`
  position: relative;
  flex-shrink: 0;

  ${({ layout }) => layout === "vertical" && css`width: 100%;`}
`;

export const FilterDropdownTrigger = styled("button")<{ open?: boolean; layout?: Layout }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 14px;
  border: none;
  background: none;
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: ${({ open }) => (open ? "var(--ref-primary)" : "var(--ref-text-primary)")};
  transition: color 0.12s ease;

  &:hover {
    color: var(--ref-primary);
  }

  ${({ layout }) =>
    layout === "vertical" &&
    css`
      width: 100%;
      justify-content: space-between;
      padding: 12px 6px;
    `}
`;

export const FilterBarLink = styled("a")<{ layout?: Layout }>`
  display: flex;
  align-items: center;
  padding: 14px 14px;
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: var(--ref-text-primary);
  text-decoration: none;
  transition: color 0.12s ease;

  &:hover {
    color: var(--ref-primary);
  }

  ${({ layout }) =>
    layout === "vertical" &&
    css`
      width: 100%;
      padding: 12px 6px;
    `}
`;

export const FilterDropdownChevron = styled("span")<{ open?: boolean }>`
  display: inline-flex;
  color: var(--ref-text-secondary);
  transition: transform 0.2s ease;
  transform: ${({ open }) => (open ? "rotate(180deg)" : "rotate(0deg)")};
`;

export const FilterDropdownPanel = styled("div")<{ layout?: Layout }>`
  position: absolute;
  top: 110%;
  left: 0;
  min-width: 200px;
  padding: 8px;
  border-radius: 14px;
  background: var(--ref-bg-elevated);
  box-shadow: var(--ref-shadow-lg);
  border: 1px solid var(--ref-border-soft);
  z-index: 20;

  ${({ layout }) =>
    layout === "vertical" &&
    css`
      position: static;
      width: 100%;
      margin-top: 0;
      padding: 2px 0 6px 14px;
      border: none;
      box-shadow: none;
      background: none;
    `}
`;

export const FilterDropdownItem = styled("a")<{ layout?: Layout }>`
  display: block;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ref-text-primary);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: var(--ref-primary-soft);
    color: var(--ref-primary);
  }

  ${({ layout }) =>
    layout === "vertical" &&
    css`
      padding: 9px 6px;
      color: var(--ref-text-secondary);

      &:hover {
        background: var(--ref-bg-subtle);
        color: var(--ref-primary);
      }
    `}
`;

export const FilterEmpty = styled("span")`
  display: block;
  padding: 12px 14px;
  font-size: 13px;
  color: var(--ref-text-secondary);
`;
