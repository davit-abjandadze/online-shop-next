import styled from "styled-components";

export const PageWrapper = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
  padding: 32px 24px 64px 24px;

  @media (max-width: 720px) {
    padding: 20px 16px 48px 16px;
  }
`;

export const Container = styled("div")`
  max-width: 1000px;
  margin: 0 auto;
`;

export const HeaderSection = styled("div")`
  margin-bottom: 32px;

  @media (max-width: 720px) {
    margin-bottom: 20px;
  }
`;

export const PageTitle = styled("h1")`
  font-size: 26px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 480px) {
    font-size: 21px;
  }
`;

export const PageSubtitle = styled("p")`
  font-size: 14px;
  color: var(--ref-text-secondary);
  margin: 0;
`;

export const Layout = styled("div")`
  display: flex;
  gap: 28px;
  align-items: flex-start;

  @media (max-width: 720px) {
    flex-direction: column;
    gap: 16px;
  }
`;

/* Sidebar menu */
export const Sidebar = styled("div")`
  width: 240px;
  flex-shrink: 0;
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--ref-border-soft);
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 720px) {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }
`;

export const SidebarItem = styled("button")<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  background-color: ${({ active }) => (active ? "var(--ref-primary-soft)" : "transparent")};
  color: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-text-secondary)")};

  &:hover {
    background-color: ${({ active }) => (active ? "var(--ref-primary-soft)" : "var(--ref-bg-subtle)")};
    color: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-text-primary)")};
  }

  @media (max-width: 720px) {
    white-space: nowrap;
    flex-shrink: 0;
    padding: 10px 14px;
    font-size: 13px;
  }
`;

export const Content = styled("div")`
  flex: 1;
  min-width: 0;
  width: 100%;
`;

export const Card = styled("div")`
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--ref-border-soft);

  @media (max-width: 480px) {
    padding: 18px;
  }
`;

export const CardTitle = styled("h2")`
  font-size: 18px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin: 0 0 20px 0;
`;

/* Avatar + summary */
export const ProfileSummary = styled("div")`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--ref-border-soft);

  @media (max-width: 480px) {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
`;

export const ProfileInfo = styled("div")`
  min-width: 0;
  flex: 1;
`;

export const AvatarCircle = styled("div")`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ref-primary) 0%, var(--ref-primary-hover) 100%);
  color: var(--ref-text-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  flex-shrink: 0;
`;

export const ProfileName = styled("div")`
  font-size: 18px;
  font-weight: 700;
  color: var(--ref-text-primary);
  overflow-wrap: break-word;
`;

export const ProfileEmail = styled("div")`
  font-size: 14px;
  color: var(--ref-text-secondary);
  margin-top: 2px;
  overflow-wrap: break-word;
`;

export const BadgeRow = styled("div")`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;

  @media (max-width: 480px) {
    justify-content: center;
  }
`;

export const Badge = styled("span")<{ variant?: "role" | "date" | "pending" | "approved" | "rejected" }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;

  ${({ variant }) => {
    switch (variant) {
      case "date":
        return "background: var(--ref-bg-subtle); color: var(--ref-text-secondary); font-weight: 400;";
      case "pending":
        return "background: var(--ref-warning-soft); color: #b45309;";
      case "approved":
        return "background: var(--ref-success-soft); color: var(--ref-success);";
      case "rejected":
        return "background: var(--ref-danger-soft); color: var(--ref-danger);";
      default:
        return "background: var(--ref-primary-soft); color: var(--ref-primary-hover);";
    }
  }}
`;

/* Form */
export const FormGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 8px;
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

  &:disabled {
    background: var(--ref-bg-subtle);
    color: var(--ref-text-secondary);
  }
`;

export const RequiredHint = styled("span")`
  font-weight: 500;
  color: var(--ref-danger);
`;

export const FieldError = styled("span")`
  display: block;
  font-size: 12px;
  color: var(--ref-danger);
  margin-top: 6px;
`;

export const Select = styled("select")`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--ref-border);
  font-size: 14px;
  outline: none;
  background: var(--ref-bg-elevated);
  transition: border-color 0.2s ease;

  &:focus {
    border-color: var(--ref-primary);
  }
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

  @media (max-width: 480px) {
    justify-content: stretch;

    button {
      width: 100%;
    }
  }
`;

/* Favorites list */
export const FavoritesList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

/* My Questions list */
export const QuestionsList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const QuestionCard = styled("div")`
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--ref-border-soft);
`;

export const QuestionCardHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
`;

export const QuestionText = styled("h3")`
  font-size: 16px;
  font-weight: 600;
  color: var(--ref-text-primary);
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

export const RejectionReasonBox = styled("div")`
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--ref-danger-soft);
  border: 1px solid var(--ref-danger);
  color: var(--ref-danger);
  font-size: 13px;
`;

export const PaginationBar = styled("div")`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
`;

export const PageButton = styled("button")`
  padding: 7px 10px 10px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--ref-border);
  background-color: var(--ref-bg-elevated);
  color: var(--ref-primary);

  &:hover:not(:disabled) {
    background-color: var(--ref-primary-soft);
    border-color: var(--ref-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PageNumbers = styled("div")`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const PageNumberButton = styled("button")<{ active?: boolean }>`
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-border)")};
  background-color: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-bg-elevated)")};
  color: ${({ active }) => (active ? "var(--ref-bg-elevated)" : "var(--ref-text-primary)")};

  &:hover:not(:disabled) {
    ${({ active }) => (active ? "" : "background-color: var(--ref-primary-soft); border-color: var(--ref-primary);")}
  }
`;

export const PageEllipsis = styled("span")`
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ref-text-secondary);
  font-weight: 600;
`;

export const EmptyState = styled("div")`
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  border: 1px dashed var(--ref-border);
`;

export const EmptyTitle = styled("h3")`
  font-size: 18px;
  font-weight: 600;
  color: var(--ref-text-primary);
  margin: 0 0 8px 0;
`;

export const EmptyText = styled("p")`
  font-size: 14px;
  color: var(--ref-text-secondary);
  margin: 0 0 20px 0;
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
  color: var(--ref-danger);
  margin: 16px 0 8px 0;
`;

export const AccessDeniedText = styled("p")`
  font-size: 14px;
  color: var(--ref-text-secondary);
  margin: 0 0 24px 0;
`;

/* Alerts */
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

/* Password input with show/hide toggle */
export const InputWrapper = styled("div")`
  position: relative;
  display: flex;
  align-items: center;
`;

export const ToggleBtn = styled("button")`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--ref-text-secondary);
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    color: var(--ref-text-primary);
    background: var(--ref-bg-subtle);
  }
`;

/* ელფოსტის დადასტურების (OTP) ველი */
export const FieldRow = styled("div")`
  display: flex;
  gap: 8px;
  align-items: flex-start;

  ${InputWrapper} {
    flex: 1;
  }
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
