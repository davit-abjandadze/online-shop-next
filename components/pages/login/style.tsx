import styled from "styled-components";
import { transparentize } from "polished";

export const Wrapper = styled("div")`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.base._5};
  padding: 24px;
`;

export const Card = styled("div")`
  width: 100%;
  max-width: 440px;
  background: ${({ theme }) => theme.colors.base._0};
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 24px rgba(0, 9, 28, 0.08);

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 24px;
  }
`;

export const Title = styled("h1")`
  font-family: "Helvetica Neue";
  font-weight: 700;
  font-size: 28px;
  line-height: 1.5;
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text.strong};
`;

export const Subtitle = styled("p")`
  font-family: "Helvetica Neue";
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 32px 0;
  color: ${({ theme }) => theme.colors.text.soft};
`;

export const Fields = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const SubmitWrapper = styled("div")`
  margin-top: 28px;
`;

export const Footer = styled("div")`
  margin-top: 24px;
  text-align: center;
  font-family: "Helvetica Neue";
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.soft};

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const ErrorBanner = styled("div")`
  padding: 12px 16px;
  border-radius: 8px;
  background-color: ${({ theme }) =>
    transparentize(0.9, theme.colors.red)};
  color: ${({ theme }) => theme.colors.red};
  font-family: "Helvetica Neue";
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
`;

export const ForgotPassword = styled("div")`
  text-align: right;
  margin-top: -8px;

  a {
    font-family: "Helvetica Neue";
    font-size: 13px;
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;
