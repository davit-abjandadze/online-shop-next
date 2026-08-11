import styled from "styled-components";

export const PageWrapper = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
  padding: 32px 24px 64px 24px;
`;

export const Container = styled("div")`
  max-width: 680px;
  margin: 0 auto;
`;

export const HeaderSection = styled("div")`
  margin-bottom: 32px;
`;

export const PageTitle = styled("h1")`
  font-size: 26px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const PageSubtitle = styled("p")`
  font-size: 14px;
  color: var(--ref-text-secondary);
  margin: 0;
`;

export const Card = styled("div")`
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--ref-border-soft);
`;

export const FormGroup = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

export const Label = styled("label")`
  font-size: 14px;
  font-weight: 600;
  color: var(--ref-text-primary);
`;

export const Input = styled("input")<{ $invalid?: boolean }>`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid ${({ $invalid }) => ($invalid ? "var(--ref-danger)" : "var(--ref-border)")};
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ $invalid }) => ($invalid ? "var(--ref-danger)" : "var(--ref-primary)")};
    box-shadow: 0 0 0 3px ${({ $invalid }) => ($invalid ? "rgba(220, 53, 69, 0.1)" : "rgba(37, 99, 235, 0.1)")};
  }
`;

export const Select = styled("select")<{ $invalid?: boolean }>`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid ${({ $invalid }) => ($invalid ? "var(--ref-danger)" : "var(--ref-border)")};
  font-size: 14px;
  outline: none;
  background: var(--ref-bg-elevated);
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ $invalid }) => ($invalid ? "var(--ref-danger)" : "var(--ref-primary)")};
    box-shadow: 0 0 0 3px ${({ $invalid }) => ($invalid ? "rgba(220, 53, 69, 0.1)" : "rgba(37, 99, 235, 0.1)")};
  }
`;

export const FieldError = styled("span")`
  display: block;
  font-size: 12px;
  color: var(--ref-danger);
`;

export const AnswerInputRow = styled("div")`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
`;

export const ActionButton = styled("button")<{ variant?: "primary" | "secondary" | "outline" | "danger" }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${({ variant }) => {
    switch (variant) {
      case "danger":
        return `
          background-color: var(--ref-danger);
          color: var(--ref-text-on-primary);
          &:hover { background-color: var(--ref-danger); }
        `;
      case "secondary":
        return `
          background-color: var(--ref-bg-subtle);
          color: var(--ref-text-primary);
          &:hover { background-color: var(--ref-border-soft); }
        `;
      case "outline":
        return `
          background-color: transparent;
          color: var(--ref-primary);
          border: 1px solid var(--ref-border);
          &:hover { background-color: var(--ref-primary-soft); border-color: var(--ref-primary); }
        `;
      case "primary":
      default:
        return `
          background-color: var(--ref-primary);
          color: var(--ref-text-on-primary);
          &:hover { background-color: var(--ref-primary-hover); }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const FormFooter = styled("div")`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--ref-border-soft);
`;

export const Alert = styled("div")<{ success?: boolean }>`
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ success }) => (success ? "var(--ref-success-soft)" : "var(--ref-danger-soft)")};
  border: 1px solid ${({ success }) => (success ? "var(--ref-success)" : "var(--ref-danger)")};
  color: ${({ success }) => (success ? "var(--ref-success)" : "var(--ref-danger)")};
`;

export const AccessDeniedCard = styled("div")`
  max-width: 480px;
  margin: 100px auto 0 auto;
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

export const AccessDeniedTitle = styled("h2")`
  font-size: 22px;
  font-weight: 700;
  color: var(--ref-danger);
  margin: 16px 0 8px 0;
`;

export const AccessDeniedText = styled("p")`
  font-size: 14px;
  color: var(--ref-text-secondary);
  margin: 0 0 24px 0;
`;
