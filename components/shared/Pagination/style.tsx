import styled from "styled-components";

export const PaginationWrapper = styled("div")`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 60px;
`;

export const PaginationList = styled("div")`
  display: flex;
  gap: 8px;
  width: 100%;
  justify-content: center;
  .hide-xs {
    display: none;
    @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
      display: flex;
    }
  }
`;

export const PaginationListItem = styled("div")<{ active?: boolean }>`
  width: 100%;
  max-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.colors.primary : theme.colors.base._10};
  border-radius: 8px;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  font-size: 13px;
  line-height: 150%;
  color: ${({ theme, active }) =>
    active ? theme.colors.text.strong : theme.colors.text.soft};
  cursor: pointer;
`;

export const PaginationListSwitch = styled("div")<{ active?: boolean }>`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: ${({ theme, active }) =>
    active ? theme.colors.text.white : theme.colors.text.soft};
  background: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.base._5};
  cursor: pointer;
  > span {
    font-size: 24px;
  }
`;
