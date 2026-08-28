import styled from "styled-components";

/* ---------- ჰედერის ქვემოთ კატეგორიების დროპდაუნ-ზოლი — მთავარი გვერდის
   იმავე ვიზუალითა და ქცევით (იხ. components/pages/home/style.ts) ---------- */

export const CategoryFilterBar = styled("div")`
  position: relative;
  z-index: 5;
  background: var(--ref-bg-elevated);
  border-bottom: 1px solid var(--ref-border-soft);
`;

export const CategoryFilterBarInner = styled("div")`
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 900px) {
    padding: 0 16px;
  }
`;

export const FilterDropdown = styled("div")`
  position: relative;
  flex-shrink: 0;
`;

export const FilterDropdownTrigger = styled("button")<{ open?: boolean }>`
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
`;

export const FilterBarLink = styled("a")`
  display: flex;
  align-items: center;
  padding: 14px 14px;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: var(--ref-text-primary);
  text-decoration: none;
  transition: color 0.12s ease;

  &:hover {
    color: var(--ref-primary);
  }
`;

export const FilterDropdownChevron = styled("span")<{ open?: boolean }>`
  display: inline-flex;
  color: var(--ref-text-secondary);
  transition: transform 0.2s ease;
  transform: ${({ open }) => (open ? "rotate(180deg)" : "rotate(0deg)")};
`;

export const FilterDropdownPanel = styled("div")`
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
`;

export const FilterDropdownItem = styled("a")`
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
`;

export const FilterEmpty = styled("span")`
  display: block;
  padding: 12px 14px;
  font-size: 13px;
  color: var(--ref-text-secondary);
`;
