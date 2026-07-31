import styled from "styled-components";

export const PageWrapper = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
  padding: 32px 24px 64px 24px;
`;

export const Container = styled("div")`
  max-width: 1000px;
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

export const Layout = styled("div")`
  display: flex;
  gap: 28px;
  align-items: flex-start;

  @media (max-width: 720px) {
    flex-direction: column;
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
  white-space: nowrap;
  background-color: ${({ active }) => (active ? "var(--ref-primary-soft)" : "transparent")};
  color: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-text-secondary)")};

  &:hover {
    background-color: ${({ active }) => (active ? "var(--ref-primary-soft)" : "var(--ref-bg-subtle)")};
    color: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-text-primary)")};
  }
`;

export const Content = styled("div")`
  flex: 1;
  min-width: 0;
`;

export const Card = styled("div")`
  background: var(--ref-bg-elevated);
  border-radius: 8px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--ref-border-soft);
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
`;

export const ProfileEmail = styled("div")`
  font-size: 14px;
  color: var(--ref-text-secondary);
  margin-top: 2px;
`;

export const Badge = styled("span")<{ variant?: "role" | "date" }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;

  ${({ variant }) =>
    variant === "date"
      ? "background: var(--ref-bg-subtle); color: var(--ref-text-secondary); font-weight: 400;"
      : "background: var(--ref-primary-soft); color: var(--ref-primary-hover);"}
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

export const Input = styled("input")`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--ref-border);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: var(--ref-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background: var(--ref-bg-subtle);
    color: var(--ref-text-secondary);
  }
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
`;

/* Favorites list */
export const FavoritesList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const PaginationBar = styled("div")`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
`;

export const PageButton = styled("button")`
  padding: 8px 16px;
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
