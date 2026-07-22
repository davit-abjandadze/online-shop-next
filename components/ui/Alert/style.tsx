import styled from "styled-components";
import Button from "../Button";

export const AlertBackground = styled("div")`
  padding: 16px;
  position: fixed;
  overflow: auto;
  z-index: 99999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Alert = styled("div")<{ shrinked?: boolean }>`
  position: relative;
  display: flex;
  margin: auto;
  width: ${({ shrinked }) => (shrinked ? "auto" : "100%")};
  max-width: ${({ shrinked }) => (shrinked ? "100%" : "")};
  min-height: ${({ shrinked }) => (shrinked ? "80px" : "120px")};
  background: white;
  box-shadow:
    0px 8px 8px -4px rgba(16, 24, 40, 0.03),
    0px 20px 24px -4px rgba(16, 24, 40, 0.08);
  border-radius: 16px;
  flex-direction: column;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    width: auto;
    min-width: ${({ shrinked }) => (shrinked ? "80px" : "600px")};
  }
`;

export const CloseBtn = styled("button")`
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  line-height: 1;
  font-size: 32px;
  transition: all 0.2s;
  cursor: pointer;

  font-size: 24px;
  color: ${({ theme }) => theme.colors.base._50};
  cursor: pointer;

  &:hover {
    opacity: 0.6;
  }
`;

export const Header = styled("div")<{
  lightHeader?: boolean;
  grayBgHeader?: boolean;
}>`
  display: flex;
  padding: ${({ lightHeader }) => (lightHeader ? "20px 20px 0" : "16px")};
  align-items: center;
  justify-content: space-between;
  border-bottom: ${({ lightHeader }) => (lightHeader ? "0" : "1px")} solid
    ${({ theme }) => theme.colors.base._10};

  background-color: ${({ theme, grayBgHeader }) =>
    grayBgHeader ? theme.colors.base._5 : "transparent"};

  border-radius: ${({ grayBgHeader }) =>
    grayBgHeader ? "16px 16px 0 0" : "0"};

  ${CloseBtn} span[class^="icon-"] {
    font-weight: 500;
  }
`;

export const AlertFooter = styled("div")`
  border-top: 1px solid ${({ theme }) => theme.colors.base._5};
`;

export const Content = styled("div")<{ scroll: boolean }>`
  display: ${({ scroll }) => (scroll ? "initial" : "flex")};
`;

export const HeadlessCloseBtn = styled(Button)`
  border-radius: 50%;
  position: absolute;
  right: 16px;
  top: 16px;
  z-index: 2;

  & > [class^="icon-"] {
    font-size: 24px;
  }

  &:active > [class^="icon-"],
  &:hover > [class^="icon-"] {
    color: ${({ theme }) => theme.colors.text.strong};
  }
`;
export const quareCloseBtn = styled(Button)`
  border-radius: 0%;
  position: absolute;
  right: 3px;
  top: 7px;
  &:hover {
    background: initial;
  }

  span {
    font-size: 24px !important;
    color: ${({ theme }) => theme.colors.base._40}!important;
  }
`;
