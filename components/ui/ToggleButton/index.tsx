import styled from "styled-components";
import { transparentize } from "polished";

const ToggleButton = styled("div")<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  -webkit-text-stroke: ${({ theme, active }) => (active ? "0.02em" : "unset")};
  -webkit-tap-highlight-color: transparent;
  background-color: ${({ theme, active }) =>
    active ? transparentize(0.9, theme.colors.primary) : theme.colors.base._5};
  color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.text.soft};
  cursor: pointer;
`;

export default ToggleButton;
