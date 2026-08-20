import styled from "styled-components";

export const PageBackground = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
`;

export const Container = styled("div")`
  max-width: 960px;
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

export const Layout = styled("div")`
  display: flex;
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 800px) {
    flex-direction: column;
  }
`;

export const SummaryList = styled("div")`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 12px;
  padding: 16px;
`;

export const SummaryItem = styled("div")`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ItemImage = styled("div")`
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: var(--ref-bg);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ItemInfo = styled("div")`
  flex: 1;
  min-width: 0;
`;

export const ItemName = styled("div")`
  font-size: 14px;
  font-weight: 700;
  color: var(--ref-text-primary);
`;

export const ItemMeta = styled("div")`
  font-size: 13px;
  color: var(--ref-text-secondary);
`;

export const ItemSubtotal = styled("div")`
  font-size: 14px;
  font-weight: 700;
  color: var(--ref-primary);
  white-space: nowrap;
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

export const FormCard = styled("form")`
  width: 340px;
  flex-shrink: 0;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 800px) {
    width: 100%;
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

export const Textarea = styled("textarea")`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--ref-border);
  background: var(--ref-bg-elevated);
  color: var(--ref-text-primary);
  font-size: 14px;
  outline: none;
  resize: vertical;
  min-height: 90px;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: var(--ref-primary);
    box-shadow: 0 0 0 3px var(--ref-primary-soft);
  }
`;

export const FieldError = styled("span")`
  font-size: 12px;
  font-weight: 500;
  color: var(--ref-danger);
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
