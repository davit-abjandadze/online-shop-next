import styled from "styled-components";

export const FooterWrapper = styled.footer`
  width: 100%;
  background: var(--ref-bg-elevated);
  border-top: 1px solid var(--ref-border-soft);
  margin-top: 40px;
  transition: background 0.2s ease, border-color 0.2s ease;
`;

export const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 16px 20px 16px;
`;

export const Top = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-between;
  padding-bottom: 24px;
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const BrandBadge = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--ref-primary);
  flex-shrink: 0;
`;

export const BrandText = styled.div`
  display: flex;
  flex-direction: column;
`;

export const BrandTitle = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: var(--ref-text-primary);
`;

export const BrandSubtitle = styled.span`
  font-size: 13px;
  color: var(--ref-text-secondary);
  max-width: 320px;
`;

export const LinksGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px 32px;
`;

export const LinkColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const LinkColumnTitle = styled.span`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ref-text-secondary);
  margin-bottom: 4px;
`;

export const FooterLink = styled.a`
  font-size: 14px;
  color: var(--ref-text-primary);
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: var(--ref-primary);
  }
`;

export const Bottom = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--ref-border-soft);
`;

export const Copyright = styled.span`
  font-size: 13px;
  color: var(--ref-text-secondary);
`;

export const MadeWith = styled.span`
  font-size: 13px;
  color: var(--ref-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
`;
