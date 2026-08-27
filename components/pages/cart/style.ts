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

export const ItemsList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

export const Item = styled("div")`
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 12px;
  padding: 14px;

  @media (max-width: 560px) {
    flex-wrap: wrap;
  }
`;

export const ItemImage = styled("div")`
  width: 72px;
  height: 72px;
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
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ItemName = styled("a")`
  font-size: 15px;
  font-weight: 700;
  color: var(--ref-text-primary);
  text-decoration: none;

  &:hover {
    color: var(--ref-primary);
  }
`;

export const ItemUnitPrice = styled("span")`
  font-size: 13px;
  color: var(--ref-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
`;

// ფასდაკლების დროს ორიგინალი ფასი — ხაზგადასმული, ერთეულის ფასის გვერდით.
export const ItemOldPrice = styled("span")`
  text-decoration: line-through;
  color: var(--ref-text-secondary);
  opacity: 0.7;
  font-size: 12px;
`;

export const ItemDiscountBadge = styled("span")`
  font-size: 11px;
  font-weight: 700;
  color: #c0392b;
  background: rgba(192, 57, 43, 0.1);
  border-radius: 6px;
  padding: 1px 6px;
`;

export const ItemStockWarning = styled("span")`
  font-size: 12px;
  font-weight: 600;
  color: #c0392b;
`;

export const QuantityStepper = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const StepperButton = styled("button")`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: transparent;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const QuantityValue = styled("span")`
  min-width: 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--ref-text-primary);
`;

export const ItemSubtotal = styled("span")`
  min-width: 90px;
  text-align: right;
  font-size: 15px;
  font-weight: 800;
  color: var(--ref-primary);
  flex-shrink: 0;
`;

export const RemoveButton = styled("button")`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--ref-danger);
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: var(--ref-danger-soft);
  }
`;

export const SummaryCard = styled("div")`
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const TotalRow = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 700;
  color: var(--ref-text-primary);
`;

export const TotalValue = styled("span")`
  font-size: 22px;
  font-weight: 800;
  color: var(--ref-primary);
`;

export const CheckoutButton = styled("button")`
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  background: var(--ref-primary);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
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
