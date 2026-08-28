import styled, { css } from "styled-components";

export const PageBackground = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
`;

// ჰედერის კონტეინერის სიგანის შესაბამისი (Header/style.tsx-ის Container: max-width 1320px) —
// გვერდის კონტენტი ჰედერის დონემდე გაფართოებულია.
export const Container = styled("div")`
  max-width: 1320px;
  margin: 0 auto;
  padding: 32px 24px 64px 24px;

  @media (max-width: 640px) {
    padding: 20px 12px 40px 12px;
  }
`;

export const Title = styled("h1")`
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--ref-text-primary);
`;

export const Layout = styled("form")`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const FormColumn = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

export const SectionCard = styled("div")`
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const SectionTitle = styled("h2")`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--ref-text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const HintIcon = styled("span")`
  font-size: 13px;
  color: var(--ref-text-secondary);
  cursor: help;
`;

export const PersonalGrid = styled("div")`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const ReadonlyField = styled("div")<{ $full?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  ${({ $full }) =>
    $full &&
    css`
      grid-column: 1 / -1;
    `}
`;

export const ReadonlyLabel = styled("span")`
  font-size: 12px;
  font-weight: 600;
  color: var(--ref-text-secondary);
`;

export const ReadonlyValue = styled("div")`
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--ref-border);
  background: var(--ref-bg);
  color: var(--ref-text-primary);
  font-size: 14px;
`;

// ელფოსტის/მობილურის/პირადი ნომრის რედაქტირებადი ველები — profile-ის იგივე
// ვიზუალური პატერნი (წითელი კონტური დაუდასტურებელი/ცარიელი მნიშვნელობისთვის).
export const Input = styled("input")<{ $invalid?: boolean }>`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid ${({ $invalid }) => ($invalid ? "var(--ref-danger)" : "var(--ref-border)")};
  background: var(--ref-bg);
  color: var(--ref-text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ $invalid }) => ($invalid ? "var(--ref-danger)" : "var(--ref-primary)")};
    box-shadow: 0 0 0 3px ${({ $invalid }) => ($invalid ? "rgba(220, 53, 69, 0.1)" : "var(--ref-primary-soft)")};
  }
`;

export const RequiredHint = styled("span")`
  font-weight: 500;
  color: var(--ref-danger);
`;

export const InputWrapper = styled("div")`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
`;

export const FieldRow = styled("div")`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

export const OtpActionBtn = styled("button")`
  flex-shrink: 0;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--ref-border);
  background: var(--ref-bg-elevated);
  color: var(--ref-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--ref-primary-soft);
    border-color: var(--ref-primary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const VerifiedBadge = styled("span")`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--ref-success-soft);
  color: var(--ref-success);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
`;

export const SaveInfoRow = styled("div")`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  width: 100%;

`;

export const SaveInfoButton = styled("button")`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: var(--ref-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  height: 41px;
  width: 100%;

  &:hover:not(:disabled) {
    background: var(--ref-primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const InfoAlert = styled("div")`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--ref-danger-soft, rgba(220, 38, 38, 0.08));
  color: var(--ref-danger);
  font-size: 13px;
  line-height: 1.5;

  a {
    color: var(--ref-danger);
    font-weight: 700;
    text-decoration: underline;
  }
`;

export const MethodRow = styled("div")`
  display: flex;
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

export const MethodOption = styled("button")<{ $active?: boolean; $disabled?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  background: var(--ref-bg);
  color: var(--ref-text-primary);
  border: 1.5px solid var(--ref-border);
  cursor: pointer;
  position: relative;
  text-align: left;

  ${({ $active }) =>
    $active &&
    css`
      border-color: var(--ref-primary);
      background: var(--ref-primary-soft);
      color: var(--ref-primary);
    `}

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.55;
      cursor: not-allowed;
    `}
`;

export const SoonBadge = styled("span")`
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--ref-bg-elevated);
  color: var(--ref-text-secondary);
`;

export const AddressCard = styled("div")`
  display: flex;
  gap: 10px;
  padding: 14px;
  border-radius: 10px;
  border: 1.5px solid var(--ref-primary);
  background: var(--ref-primary-soft);
`;

export const AddressBody = styled("div")`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled("label")`
  font-size: 13px;
  font-weight: 600;
  color: var(--ref-text-primary);
`;

export const Textarea = styled("textarea")<{ $invalid?: boolean }>`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid ${({ $invalid }) => ($invalid ? "var(--ref-danger)" : "var(--ref-border)")};
  background: var(--ref-bg-elevated);
  color: var(--ref-text-primary);
  font-size: 14px;
  outline: none;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ $invalid }) => ($invalid ? "var(--ref-danger)" : "var(--ref-primary)")};
    box-shadow: 0 0 0 3px ${({ $invalid }) => ($invalid ? "rgba(220, 53, 69, 0.1)" : "var(--ref-primary-soft)")};
  }
`;

export const FieldError = styled("span")`
  font-size: 12px;
  font-weight: 500;
  color: var(--ref-danger);
`;

export const SummaryColumn = styled("div")`
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: sticky;
  top: 24px;

  @media (max-width: 900px) {
    position: static;
  }
`;

export const SummaryTitle = styled("h2")`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--ref-text-primary);
`;

export const SummaryRow = styled("div")<{ $discount?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: var(--ref-text-secondary);

  ${({ $discount }) =>
    $discount &&
    css`
      color: var(--ref-danger);
      font-weight: 600;
    `}
`;

export const Divider = styled("div")`
  height: 1px;
  background: var(--ref-border-soft);
  margin: 4px 0;
`;

export const TotalRow = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin-top: 6px;
  padding-top: 12px;
  border-top: 1px solid var(--ref-border-soft);
`;

export const TotalValue = styled("span")`
  font-size: 20px;
  font-weight: 800;
  color: var(--ref-primary);
`;

export const DeliveryNotice = styled("div")`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--ref-primary-soft);
  color: var(--ref-primary);
  font-size: 12px;
  line-height: 1.5;
  margin: 6px 0;
`;

export const SubmitButton = styled("button")`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  border-radius: 10px;
  background: var(--ref-primary);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--ref-primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const EmptyState = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 20px;
  text-align: center;
  color: var(--ref-text-secondary);
`;

export const EmptyStateTitle = styled("h2")`
  font-size: 18px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin: 0;
`;

export const ActionButton = styled("button")`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background-color: var(--ref-primary);
  color: var(--ref-text-on-primary);

  &:hover {
    background-color: var(--ref-primary-hover);
  }
`;

export const AccessDeniedCard = styled("div")`
  max-width: 480px;
  margin: 100px auto 0 auto;
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  @media (max-width: 480px) {
    margin: 48px auto 0 auto;
    padding: 32px 20px;
  }
`;

export const AccessDeniedTitle = styled("h2")`
  font-size: 22px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin: 16px 0 8px 0;
`;

export const AccessDeniedText = styled("p")`
  font-size: 14px;
  color: var(--ref-text-secondary);
  margin: 0 0 24px 0;
`;
