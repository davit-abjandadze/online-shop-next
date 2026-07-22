import styled from "styled-components";

type TextProps = {
  caps?: boolean;
  bold?: boolean;
  softColor?: boolean;
};

// Headings

export const H1 = styled("h1")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 32px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const H2 = styled("h2")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 28px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const H3 = styled("h3")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 24px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const H4 = styled("h4")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 20px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const H5 = styled("h5")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 18px;
  line-height: 28px;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const H6 = styled("h6")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 16px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const H7 = styled("h6")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 14px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const H8 = styled("h6")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 12px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const H9 = styled("h6")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 10px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;

// Subtitles

export const S1 = styled("span")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 18px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const S2 = styled("span")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 16px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const S3 = styled("span")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 14px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const S4 = styled("span")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 12px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const S5 = styled("span")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 10px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;

// Paragraphs

export const P1 = styled("p")<TextProps>`
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const P2 = styled("p")<TextProps>`
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const P3 = styled("p")<TextProps>`
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const P4 = styled("p")<TextProps>`
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const P5 = styled("p")<TextProps>`
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;

// Button Types
export const B14 = styled("span")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 14px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
export const B12 = styled("span")<TextProps>`
  font-style: normal;
  font-weight: ${({ bold }) => (bold ? 700 : 500)};
  font-size: 12px;
  line-height: 150%;
  margin: 0;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};
  color: ${({ theme, softColor }) =>
    softColor ? theme.colors.text.soft : theme.colors.text.strong};
`;
