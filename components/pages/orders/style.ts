import styled from "styled-components";

export const PageBackground = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
`;

export const Container = styled("div")`
  max-width: 900px;
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

export const ListWrapper = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
`;

export const OrderCard = styled("div")`
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

export const OrderInfo = styled("div")`
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const OrderIdRow = styled("div")`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const OrderId = styled("span")`
  font-size: 15px;
  font-weight: 700;
  color: var(--ref-text-primary);
`;

export const OrderMeta = styled("div")`
  font-size: 13px;
  color: var(--ref-text-secondary);
`;

export const OrderTotal = styled("div")`
  font-size: 16px;
  font-weight: 800;
  color: var(--ref-primary);
  white-space: nowrap;
`;

export const OrderActions = styled("div")`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ActionButton = styled("button")<{ variant?: "primary" | "outline" }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  ${({ variant }) =>
    variant === "primary"
      ? `
        border: none;
        background-color: var(--ref-primary);
        color: var(--ref-text-on-primary);
        &:hover { background-color: var(--ref-primary-hover); }
      `
      : `
        border: 1px solid var(--ref-border);
        background: transparent;
        color: var(--ref-primary);
        &:hover { background-color: var(--ref-primary-soft); border-color: var(--ref-primary); }
      `}
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

export const PageIndicator = styled("span")`
  font-size: 14px;
  font-weight: 600;
  color: var(--ref-text-secondary);
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

export const PrimaryButton = styled("button")`
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
