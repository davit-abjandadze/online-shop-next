import styled, { keyframes } from "styled-components";

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

// გვერდს არ ბლოკავს (overlay-ის გარეშე) — მომხმარებელს საიტის დათვალიერება
// არჩევანამდეც შეუძლია; მობაილზე ქვემოთ სრულ სიგანეზე, დესკტოპზე მარცხენა კუთხეში.
export const Dialog = styled("div")`
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 16px;
  z-index: 1100;
  max-width: 440px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid var(--ref-border);
  background: var(--ref-bg-elevated);
  box-shadow: var(--ref-shadow-lg);
  color: var(--ref-text-primary);
  font-family: var(--ref-font-body);
  animation: ${slideUp} 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  @media (min-width: 640px) {
    left: 24px;
    right: auto;
    bottom: 24px;
  }
`;

export const Header = styled("div")`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
`;

export const Title = styled("h2")`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
`;

export const CloseButton = styled("button")`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: var(--ref-bg-subtle);
  color: var(--ref-text-secondary);
  cursor: pointer;

  &:hover {
    color: var(--ref-text-primary);
  }
`;

export const Text = styled("p")`
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ref-text-secondary);

  a {
    color: var(--ref-primary);
    font-weight: 600;
    text-decoration: underline;
  }
`;

export const Actions = styled("div")`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Button = styled("button")<{ variant?: "primary" | "secondary" | "ghost" }>`
  flex: 1 1 auto;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  border: 1px solid ${({ variant }) => (variant === "primary" ? "var(--ref-primary)" : "var(--ref-border)")};
  background: ${({ variant }) =>
    variant === "primary" ? "var(--ref-primary)" : variant === "ghost" ? "transparent" : "var(--ref-bg-elevated)"};
  color: ${({ variant }) => (variant === "primary" ? "var(--ref-text-on-primary)" : "var(--ref-text-primary)")};

  &:hover {
    border-color: var(--ref-primary);
    ${({ variant }) => (variant === "primary" ? "background: var(--ref-primary-hover);" : "color: var(--ref-primary);")}
  }
`;

export const CategoryList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
`;

export const CategoryRow = styled("label")`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--ref-bg);
  cursor: pointer;
`;

export const CategoryInfo = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const CategoryTitle = styled("span")`
  font-size: 13px;
  font-weight: 700;
`;

export const CategoryText = styled("span")`
  font-size: 12px;
  line-height: 1.5;
  color: var(--ref-text-secondary);
`;

// checkbox-ზე აგებული გადამრთველი (კლავიატურით/screen reader-ით ხელმისაწვდომი)
export const Switch = styled("span")`
  position: relative;
  flex-shrink: 0;
  width: 40px;
  height: 22px;
  margin-top: 2px;

  input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }

  input:disabled {
    cursor: not-allowed;
  }

  span {
    position: absolute;
    inset: 0;
    border-radius: 999px;
    background: var(--ref-text-disabled);
    transition: background 0.15s ease;
    pointer-events: none;
  }

  span::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    box-shadow: var(--ref-shadow-sm);
    transition: transform 0.15s ease;
  }

  input:checked + span {
    background: var(--ref-primary);
  }

  input:checked + span::after {
    transform: translateX(18px);
  }

  input:disabled + span {
    opacity: 0.6;
  }

  input:focus-visible + span {
    outline: 2px solid var(--ref-primary);
    outline-offset: 2px;
  }
`;
