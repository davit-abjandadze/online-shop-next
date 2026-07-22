import styled from "styled-components";

export const Wrapper = styled("div")<{
  active?: boolean;
  stretch?: boolean;
  dir?: "left" | "right";
  textSize?: number;
  textColor?: string;
}>`
  /* text-align: ${({ dir }) => dir}; */

  /* & span[class^="icon-"] {
  } */
  svg {
    flex-shrink: 0;
  }
  width: ${({ stretch }) => (stretch ? "100%" : "initial")};
  padding: 14px 12px;
  display: flex;
  flex-direction: ${({ dir }) => (dir === "left" ? "row" : "row-reverse")};
  align-items: center;
  column-gap: 8px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: ${({ theme }) => theme.colors.text.soft};
  border-radius: 8px;
  transition: box-shadow 0.2s;
  box-shadow: 0 0 0 1px
    ${({ active, theme }) =>
      active ? theme.colors.primary : theme.colors.base._5};
  cursor: pointer;
  > div {
    width: 20px;
    height: 20px;
    will-change: transform;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  svg {
    width: 20px;
    height: 20px;
  }
`;
