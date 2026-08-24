import styled from "styled-components";

export const DropdownWrap = styled("div")`
  position: relative;
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
`;

export const DropdownButton = styled("button")<{ open?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
  padding: 8px 14px;
  border-radius: 999px;
  border: 2px solid ${({ open }) => (open ? "var(--ref-primary)" : "var(--ref-border-soft)")};
  background-color: var(--ref-bg-elevated);
  color: ${({ open }) => (open ? "var(--ref-primary)" : "var(--ref-text-secondary)")};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: var(--ref-primary);
    color: var(--ref-primary);
  }

  ${({ open }) => open && `box-shadow: 0 0 0 3px rgba(66, 56, 169, 0.12);`}
`;

export const DropdownButtonLabel = styled("span")`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DropdownChevron = styled("span")<{ open?: boolean }>`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  transform: ${({ open }) => (open ? "rotate(180deg)" : "rotate(0deg)")};
  color: inherit;
  opacity: 0.75;
`;

// ჩამოსაშლელი მენიუ — ბუნებრივი <select>-ისგან განსხვავებით, სრულად
// ჩვენი კონტროლის ქვეშაა (ფონი/ფერი/hover/ანიმაცია).
export const DropdownMenu = styled("div")`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 30;
  min-width: 100%;
  width: max-content;
  max-width: 280px;
  max-height: 320px;
  overflow-y: auto;
  padding: 6px;
  border-radius: 16px;
  border: 1px solid var(--ref-border-soft);
  background-color: var(--ref-bg-elevated);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14), 0 2px 8px rgba(15, 23, 42, 0.06);
  animation: ref-dropdown-in 0.14s ease;

  @keyframes ref-dropdown-in {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

export const DropdownItem = styled("div")<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: ${({ active }) => (active ? 700 : 500)};
  color: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-text-primary)")};
  background-color: ${({ active }) => (active ? "var(--ref-primary-soft, rgba(66, 56, 169, 0.1))" : "transparent")};
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.12s ease, color 0.12s ease;

  &:hover {
    background-color: var(--ref-primary-soft, rgba(66, 56, 169, 0.1));
    color: var(--ref-primary);
  }
`;

export const DropdownItemLabel = styled("span")`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DropdownCheck = styled("span")`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--ref-primary);
`;
