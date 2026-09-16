import styled, { css } from "styled-components";

export const PageBackground = styled("div")`
  min-height: 100vh;
  background-color: var(--ref-bg);
`;

export const Container = styled("div")`
  max-width: 1280px;
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

export const Layout = styled("div")`
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const MapPanel = styled("div")`
  position: sticky;
  top: 16px;
  height: 620px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--ref-border);
  box-shadow: var(--ref-shadow-sm);

  @media (max-width: 900px) {
    position: static;
    height: 380px;
    order: -1;
  }
`;

export const ListPanel = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 620px;
  overflow-y: auto;
  padding-right: 4px;

  @media (max-width: 900px) {
    max-height: none;
    overflow-y: visible;
  }
`;

export const BranchCard = styled("button")<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  padding: 16px;
  border-radius: 14px;
  background: var(--ref-bg-elevated);
  border: 1px solid ${(p) => (p.$active ? "var(--ref-primary)" : "var(--ref-border)")};
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  font-family: inherit;

  &:hover {
    border-color: var(--ref-primary);
  }
`;

export const BranchCardTitle = styled("div")`
  font-size: 16px;
  font-weight: 700;
  color: var(--ref-text-primary);
`;

export const BranchCardCompany = styled("div")`
  font-size: 12px;
  font-weight: 600;
  color: var(--ref-primary);
`;

export const BranchCardRow = styled("div")`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--ref-text-secondary);
  line-height: 1.4;
`;

export const BranchCardRowIcon = styled("span")`
  display: inline-flex;
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--ref-primary);
`;

export const HoursTable = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
`;

export const WorkingHoursRow = styled("div")<{ $today?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: ${(p) => (p.$today ? "var(--ref-text-primary)" : "var(--ref-text-secondary)")};

  ${(p) =>
    p.$today &&
    css`
      font-weight: 700;
    `}
`;

export const WorkingHoursDay = styled("span")``;

export const WorkingHoursHours = styled("span")``;

export const StateBox = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  text-align: center;
  color: var(--ref-text-secondary);
`;

export const MapMarker = styled("div")<{ $active?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: ${(p) => (p.$active ? "var(--ref-primary)" : "var(--ref-accent)")};
  box-shadow: var(--ref-shadow-md);
  cursor: pointer;
  border: 2px solid var(--ref-bg-elevated);
`;
