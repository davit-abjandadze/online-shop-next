import styled from "styled-components";

// `variant` განსაზღვრავს ტრიგერის ვიზუალურ სქემას — header გამჭვირვალე/ღია
// ფონზეა (`--ref-bg-subtle`), footer კი მუქ ფონზეა, ამიტომ იქ ნახევრად
// გამჭვირვალე თეთრზეა აწყობილი, რომ ორივე ფონზე კონტრასტული დარჩეს.
export const Wrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

export const Trigger = styled.button<{ variant: "header" | "footer" }>`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  ${({ variant }) =>
    variant === "footer"
      ? `
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.82);

        &:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.28);
        }
      `
      : `
        border: 1px solid var(--ref-border-soft);
        background: var(--ref-bg-subtle);
        color: var(--ref-text-secondary);

        &:hover {
          background: var(--ref-border-soft);
          border-color: var(--ref-primary);
          color: var(--ref-primary);
        }
      `}
`;

export const TriggerLabel = styled.span`
  text-transform: uppercase;
`;

export const FlagIcon = styled.img`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

export const DropdownItemLeft = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DropdownMenu = styled.div<{ variant: "header" | "footer" }>`
  position: absolute;
  ${({ variant }) => (variant === "footer" ? "bottom: calc(100% + 10px);" : "top: calc(100% + 10px);")}
  right: 0;
  width: 160px;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 14px;
  box-shadow: var(--ref-shadow-lg);
  padding: 8px;
  z-index: 100;
  animation: languageSwitcherFadeIn 0.2s ease;

  @keyframes languageSwitcherFadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const DropdownItem = styled.button<{ active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  background: ${({ active }) => (active ? "var(--ref-bg-subtle)" : "none")};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: ${({ active }) => (active ? 700 : 500)};
  color: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-text-primary)")};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    background: var(--ref-bg-subtle);
  }
`;
