import styled from "styled-components";
import { StyledTextLink } from ".";

export const TextLink = styled("a")<StyledTextLink>`
  color: ${({ theme }) => theme.colors.primary} !important;
  line-height: 1;
  padding: 8px 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  text-decoration: none;
  font-feature-settings: ${({ caps }) => (caps ? '"case" on' : "initial")};

  & span[class^="icon-"] {
    font-size: 16px;
  }

  &:hover {
    text-decoration: underline;
  }
`;
