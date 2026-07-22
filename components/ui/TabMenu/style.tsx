import { Link } from "react-scroll";
import styled from "styled-components";

export const TabNav = styled("nav")<{ bottomBorder: boolean }>`
  display: flex;
  padding: ${({ bottomBorder }) => (bottomBorder ? "0 16px" : "0")};
  border-bottom: ${({ theme, bottomBorder }) =>
    bottomBorder ? `1px solid ${theme.colors.base._5}` : "none"};
`;

export const TabNavItem = styled("button")<{
  isActive: boolean;
  lowerCase: boolean;
}>`
  font-size: 14px;
  line-height: 16px;
  margin: 0;
  padding: 15px 0 14px;
  border: none;
  font-weight: 500;
  box-sizing: border-box;
  background-color: transparent;
  cursor: pointer;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.text.soft};
  border-bottom: 2px solid
    ${({ theme, isActive }) =>
      isActive ? theme.colors.primary : "transparent"};

  font-feature-settings: "case" ${({ lowerCase }) => (lowerCase ? "off" : "on")};
  text-transform: ${({ lowerCase }) => (lowerCase ? "lowercase" : "uppercase")};

  .active & {
    color: ${({ theme }) => theme.colors.primary};
    border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  }

  &:not(:last-of-type) {
    margin-right: 16px;
  }
`;

export const SCLink = styled(Link)`
  &:not(:last-of-type) {
    margin-right: 16px;
  }
`;
