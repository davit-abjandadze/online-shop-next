import styled from "styled-components";

export const PageBackground = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
`;

export const Container = styled("div")`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 64px 24px;

  @media (max-width: 640px) {
    padding: 20px 12px 40px 12px;
  }
`;

export const PageHeader = styled("div")`
  margin-bottom: 24px;
`;

export const PageTitle = styled("h1")`
  margin: 0 0 4px 0;
  font-size: 26px;
  font-weight: 800;
  color: var(--ref-text-primary);
`;

export const PageSubtitle = styled("p")`
  margin: 0;
  font-size: 14px;
  color: var(--ref-text-secondary);
`;

export const ProductsGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 460px) {
    grid-template-columns: 1fr;
  }
`;

export const EmptyState = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 20px;
  text-align: center;
  color: var(--ref-text-secondary);
`;

export const EmptyStateTitle = styled("h3")`
  margin: 0;
  font-size: 18px;
  color: var(--ref-text-primary);
`;

export const EmptyStateLink = styled("a")`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 12px;
  background: var(--ref-primary);
  color: var(--ref-text-on-primary);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    background: var(--ref-primary-hover);
  }
`;
