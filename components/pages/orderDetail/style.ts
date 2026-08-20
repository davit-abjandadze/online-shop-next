import styled from "styled-components";

export const PageBackground = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
`;

export const Container = styled("div")`
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px 64px 24px;

  @media (max-width: 640px) {
    padding: 20px 12px 40px 12px;
  }
`;

export const BackLink = styled("button")`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ref-text-secondary);
  font-size: 14px;
  font-weight: 600;
  padding: 0 0 16px 0;

  &:hover {
    color: var(--ref-primary);
  }
`;

export const Card = styled("div")`
  background: var(--ref-bg-elevated);
  border: 1px solid var(--ref-border-soft);
  border-radius: 12px;
  padding: 24px;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const HeaderRow = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--ref-border-soft);
`;

export const OrderTitle = styled("h1")`
  font-size: 22px;
  font-weight: 800;
  color: var(--ref-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const MetaGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

export const MetaItem = styled("div")``;

export const MetaLabel = styled("div")`
  font-size: 12px;
  font-weight: 600;
  color: var(--ref-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

export const MetaValue = styled("div")`
  font-size: 14px;
  font-weight: 600;
  color: var(--ref-text-primary);
`;

export const ItemsList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

export const Item = styled("div")`
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--ref-bg);
  border-radius: 8px;
  padding: 12px 14px;
`;

export const ItemImage = styled("div")`
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: var(--ref-bg-elevated);
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

export const ItemName = styled("a")`
  font-size: 14px;
  font-weight: 700;
  color: var(--ref-text-primary);
  text-decoration: none;

  &:hover {
    color: var(--ref-primary);
  }
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
  font-size: 16px;
  font-weight: 700;
  color: var(--ref-text-primary);
  padding-top: 16px;
  border-top: 1px solid var(--ref-border-soft);
`;

export const TotalValue = styled("span")`
  font-size: 22px;
  font-weight: 800;
  color: var(--ref-primary);
`;

export const PayButton = styled("button")`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  background: var(--ref-primary);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
  justify-content: center;

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

// გადახდის სტატუსის ბანერი — BOG-იდან ?payment=success|fail-ით დაბრუნებისას.
export const PaymentBanner = styled("div")<{ variant: "pending" | "success" | "fail" }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: 10px;
  padding: 16px 18px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;

  ${({ variant }) => {
    switch (variant) {
      case "success":
        return "background: var(--ref-success-soft); color: var(--ref-success);";
      case "fail":
        return "background: var(--ref-danger-soft); color: var(--ref-danger);";
      case "pending":
      default:
        return "background: var(--ref-warning-soft); color: #b45309;";
    }
  }}
`;

export const PaymentBannerActions = styled("div")`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const PaymentBannerButton = styled("button")`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--ref-primary);
  color: #fff;
  font-size: 13px;
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

export const PaymentBannerLinkButton = styled("button")`
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  font-size: 13px;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
`;
